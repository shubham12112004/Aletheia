import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { hasSupabaseConfig, supabase } from '@/lib/supabase';

type View = 'landing' | 'auth' | 'dashboard';
type AuthMode = 'login' | 'register' | 'reset';

type User = {
  email: string;
  name: string;
  provider?: 'email' | 'google';
};

type AuthState = {
  token: string | null;
  user: User | null;
  view: View;
  authMode: AuthMode;
  setSession: (session: { token: string; user: User }) => void;
  clearSession: () => Promise<void> | void;
  logout: () => void;
  navigate: (v: View, authMode?: AuthMode) => void;
  setAuthMode: (mode: AuthMode) => void;
  updateUser: (updates: Partial<Pick<User, 'name' | 'email'>>) => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);
const STORAGE_KEY = 'aletheia.auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>('landing');
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  const setSession = useCallback((session: { token: string; user: User }) => {
    setToken(session.token);
    setUser(session.user);
    setView('dashboard');
    // Sessions intentionally remain in memory: every new visit starts at landing and sign-in.
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore storage errors
    }
  }, []);

  const clearSession = useCallback(async () => {
    setToken(null);
    setUser(null);
    setView('landing');
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore storage errors
    }

    if (supabase) await supabase.auth.signOut();
  }, []);

  // Never restore a prior workspace on a new visit. The intended flow is landing â†’ login â†’ dashboard.
  useEffect(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore storage errors
    }
    if (hasSupabaseConfig && supabase) void supabase.auth.signOut();
  }, []);

  const navigate = useCallback((nextView: View, nextAuthMode?: AuthMode) => {
    if (nextView === 'dashboard' && !token) {
      setView('auth');
      if (nextAuthMode) setAuthMode(nextAuthMode);
      return;
    }
    if (nextAuthMode) setAuthMode(nextAuthMode);
    setView(nextView);
  }, [token]);

  const updateUser = useCallback((updates: Partial<Pick<User, 'name' | 'email'>>) => {
    setUser((current) => current ? { ...current, ...updates } : current);
  }, []);

  const logout = useCallback(() => {
    void clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({ token, user, view, authMode, setSession, clearSession, logout, navigate, setAuthMode, updateUser }),
    [token, user, view, authMode, setSession, clearSession, logout, navigate, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export type { AuthMode, View, User };