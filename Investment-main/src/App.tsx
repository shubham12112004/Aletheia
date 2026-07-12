import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LandingView } from '@/components/LandingView';
import { AuthView } from '@/components/AuthView';
import { DashboardView } from '@/components/DashboardView';

function Router() {
  const { view, token } = useAuth();

  // Keep dark mode on for all views
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Guard: if somehow on dashboard without a token, bounce to auth
  if (view === 'dashboard' && !token) {
    return <AuthView />;
  }

  if (view === 'auth') return <AuthView />;
  if (view === 'dashboard') return <DashboardView />;
  return <LandingView />;
}

function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}

export default App;
