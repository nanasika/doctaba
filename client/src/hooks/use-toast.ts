import { useState } from "react";

interface Toast {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = ({ title, description, variant = "default", duration = 5000 }: Toast) => {
    const newToast = { title, description, variant, duration };
    setToasts((prev) => [...prev, newToast]);

    // Auto-remove toast after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t !== newToast));
    }, duration);
  };

  return {
    toast,
    toasts,
  };
}