import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { LandingView } from '@/components/LandingView';
import { AuthView } from '@/components/AuthView';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { TerminalPage } from '@/pages/TerminalPage';
import { MarketsPage } from '@/pages/MarketsPage';
import { ScreenerPage } from '@/pages/ScreenerPage';
import { PortfoliosPage } from '@/pages/PortfoliosPage';
import { WatchlistPage } from '@/pages/WatchlistPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { SettingsPage } from '@/pages/SettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function Router() {
  return (
    <Routes>
      <Route path="/" element={<LandingView />} />
      <Route path="/auth" element={<AuthView />} />
      <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="terminal" element={<TerminalPage />} />
        <Route path="markets" element={<MarketsPage />} />
        <Route path="screener" element={<ScreenerPage />} />
        <Route path="portfolios" element={<PortfoliosPage />} />
        <Route path="watchlist" element={<WatchlistPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route index element={<Navigate to="terminal" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
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
