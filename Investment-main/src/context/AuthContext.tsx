import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';

type View = 'landing' | 'auth' | 'dashboard';
type AuthMode = 'login' | 'register' | 'reset';

type User = {
  email: string;
  name: string;
  picture?: string;
  provider?: 'email' | 'google';
};

type AuthState = {
  token: string | null;
  user: User | null;
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
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  
  // Load session from storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const session = JSON.parse(stored);
        if (session && session.token && session.user) {
          setToken(session.token);
          setUser(session.user);
        }
      }
    } catch {
      // ignore parse errors
    }
  }, []);
  
  const navigateRoute = useNavigate();

  const setSession = useCallback((session: { token: string; user: User }) => {
    setToken(session.token);
    setUser(session.user);
    navigateRoute('/app/terminal');
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // ignore storage errors
    }
  }, [navigateRoute]);

  const clearSession = useCallback(async () => {
    setToken(null);
    setUser(null);
    navigateRoute('/');
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore storage errors
    }
  }, [navigateRoute]);

  // Removed faulty useEffect that deleted session on load

  const navigate = useCallback((nextView: View, nextAuthMode?: AuthMode) => {
    if (nextAuthMode) setAuthMode(nextAuthMode);
    
    if (nextView === 'dashboard') {
      if (!token) {
        navigateRoute('/auth');
      } else {
        navigateRoute('/app/terminal');
      }
    } else if (nextView === 'auth') {
      navigateRoute('/auth');
    } else if (nextView === 'landing') {
      navigateRoute('/');
    }
  }, [token, navigateRoute]);

  const updateUser = useCallback((updates: Partial<Pick<User, 'name' | 'email'>>) => {
    setUser((current) => current ? { ...current, ...updates } : current);
  }, []);

  const logout = useCallback(() => {
    void clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({ token, user, authMode, setSession, clearSession, logout, navigate, setAuthMode, updateUser }),
    [token, user, authMode, setSession, clearSession, logout, navigate, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export type { AuthMode, View, User };