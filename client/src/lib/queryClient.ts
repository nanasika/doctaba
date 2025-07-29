import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      queryFn: async ({ queryKey }) => {
        const url = queryKey[0] as string;
        const response = await fetch(url, {
          credentials: 'same-origin',
        });

        if (!response.ok) {
          throw new Error(`${response.status}: ${response.statusText}`);
        }

        return response.json();
      },
    },
  },
});

export async function apiRequest(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'same-origin',
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || response.statusText;
    } catch {
      errorMessage = errorText || response.statusText;
    }
    throw new Error(`${response.status}: ${errorMessage}`);
  }

  return response.json();
}