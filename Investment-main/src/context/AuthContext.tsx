import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
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
};

const AuthContext = createContext<AuthState | undefined>(undefined);

const STORAGE_KEY = 'aletheia.auth';

function buildDisplayName(email: string, fallbackName?: string | null) {
  if (fallbackName?.trim()) return fallbackName.trim();

  const username = email.split('@')[0] || 'Analyst';
  return username
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function sessionToUser(session: Session): User {
  const provider = session.user.app_metadata?.provider === 'google' ? 'google' : 'email';
  const email = session.user.email ?? '';
  const name = buildDisplayName(
    email,
    session.user.user_metadata?.full_name ?? session.user.user_metadata?.name ?? undefined
  );

  return { email, name, provider };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>('landing');
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  const setSession = useCallback((session: { token: string; user: User }) => {
    setToken(session.token);
    setUser(session.user);
    setView('dashboard');
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
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

    if (supabase) {
      await supabase.auth.signOut();
    }
  }, []);

  // hydrate from storage so a refresh keeps you signed in
  useEffect(() => {
    if (hasSupabaseConfig && supabase) {
      let mounted = true;

      supabase.auth.getSession().then(({ data }) => {
        if (!mounted) return;
        const session = data.session;
        if (session) {
          setToken(session.access_token);
          setUser(sessionToUser(session));
          setView('dashboard');
        }
      });

      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          setToken(session.access_token);
          setUser(sessionToUser(session));
          setView('dashboard');
          try {
            localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify({ token: session.access_token, user: sessionToUser(session) })
            );
          } catch {
            // ignore storage errors
          }
        } else {
          setToken(null);
          setUser(null);
          setView((current) => (current === 'dashboard' ? 'landing' : current));
          try {
            localStorage.removeItem(STORAGE_KEY);
          } catch {
            // ignore storage errors
          }
        }
      });

      return () => {
        mounted = false;
        listener.subscription.unsubscribe();
      };
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { token: string; user: User };
        if (parsed?.token && parsed?.user) {
          setToken(parsed.token);
          setUser(parsed.user);
          setView('dashboard');
        }
      }
    } catch {
      // ignore malformed storage
    }
  }, []);

  const navigate = useCallback((v: View, nextAuthMode?: AuthMode) => {
    // guard dashboard — can't navigate there without a token
    if (v === 'dashboard' && !token) {
      setView('auth');
      if (nextAuthMode) setAuthMode(nextAuthMode);
      return;
    }
    if (nextAuthMode) setAuthMode(nextAuthMode);
    setView(v);
  }, [token]);

  const logout = useCallback(() => {
    void clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({ token, user, view, authMode, setSession, clearSession, logout, navigate, setAuthMode }),
    [token, user, view, authMode, setSession, clearSession, logout, navigate]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export type { AuthMode, View, User };
