import { useState } from 'react';
import { Router, Route, Switch } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Toaster } from '@/components/ui/toaster';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import AppointmentsPage from './pages/AppointmentsPage';
import BookAppointmentPage from './pages/BookAppointmentPage';
import VideoCallPage from './pages/VideoCallPageSimple';
import DocumentsPage from './pages/DocumentsPage';
import MessagesPage from './pages/MessagesPage';
import AuthPage from './pages/AuthPage';

function AppRouter() {
  const { user, isLoading } = useAuth();
  const [currentCall, setCurrentCall] = useState<string | null>(null);

  const handleJoinCall = (appointmentId: string) => {
    setCurrentCall(appointmentId);
  };

  const handleEndCall = () => {
    setCurrentCall(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Switch>
        {!user ? (
          <div className="min-h-screen bg-gray-50">
            <Switch>
              <Route path="/auth" component={AuthPage} />
              <Route component={AuthPage} />
            </Switch>
          </div>
        ) : (
          <>
            {/* Video call route - completely isolated with full screen overlay */}
            <Route path="/video-call/:id">
              {(params) => (
                <div className="fixed inset-0 z-50 bg-gray-900">
                  <VideoCallPage
                    appointmentId={params.id}
                    onEndCall={handleEndCall}
                  />
                </div>
              )}
            </Route>
            
            {/* All other routes with normal layout */}
            <Route>
              <div className="min-h-screen bg-gray-50">
                <Header userName={user?.firstName || user?.email || 'User'} />
                <Switch>
                  <Route path="/" component={HomePage} />
                  <Route path="/home" component={HomePage} />
                  <Route path="/appointments">
                    <AppointmentsPage 
                      onJoinCall={handleJoinCall} 
                      userType={user?.userType as 'doctor' | 'patient' || 'patient'}
                    />
                  </Route>
                  <Route path="/book-appointment">
                    <BookAppointmentPage currentUser={user} />
                  </Route>
                  <Route path="/documents" component={DocumentsPage} />
                  <Route path="/messages" component={MessagesPage} />
                  <Route>
                    <HomePage />
                  </Route>
                </Switch>
              </div>
            </Route>
          </>
        )}
      </Switch>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRouter />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;