import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { LandingView } from '@/components/LandingView';
import { AuthView } from '@/components/AuthView';
import { DashboardView } from '@/components/DashboardView';

function Router() {
  const { view, token } = useAuth();

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
    <ThemeProvider>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
