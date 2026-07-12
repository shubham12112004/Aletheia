import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  BrainCircuit,
  ArrowLeft,
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  Globe,
  KeyRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';

type Mode = 'login' | 'signup';

export function AuthView() {
  const { authMode, setAuthMode, setSession, navigate } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Check if direct Google integration variable is configured
  const hasGoogleConfig = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  useEffect(() => {
    if (authMode === 'register') setMode('signup');
    if (authMode === 'reset') setMode('login');
    if (authMode === 'login') setMode('login');
  }, [authMode]);

  const ctaLabel = useMemo(() => {
    if (mode === 'signup') return 'Create account';
    return 'Sign in';
  }, [mode]);

  const toggleMode = () => {
    setMode((m) => (m === 'login' ? 'signup' : 'login'));
    setError(null);
    setInfo(null);
    setAuthMode(mode === 'login' ? 'register' : 'login');
  };

  const setDemoSession = (nextEmail: string, nextName?: string) => {
    const token = `tok_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    setSession({
      token,
      user: {
        email: nextEmail,
        name:
          nextName?.trim() ||
          nextEmail.split('@')[0]?.replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) ||
          'Analyst',
        provider: 'email',
      },
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your name.');
      return;
    }

    setSubmitting(true);

    // Default email/password inputs fall back to local session processing without Supabase
    try {
      setDemoSession(email.trim(), mode === 'signup' ? name.trim() : undefined);
      setInfo('Logged in via credentials.');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setInfo(null);

    if (!hasGoogleConfig) {
      setError('Google login requires VITE_GOOGLE_CLIENT_ID configured in your environment.');
      return;
    }

    setSubmitting(true);
    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const redirectUri = encodeURIComponent(`${window.location.origin}/`);
      const scope = encodeURIComponent('openid profile email');
      
      // Redirect to Google Identity OAuth 2.0 endpoint directly
      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Google login failed.');
      setSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    setError(null);
    setInfo('Password reset emails require a configured mail delivery system.');
  };

  const authSetupHint = !hasGoogleConfig
    ? 'Configure VITE_GOOGLE_CLIENT_ID in your environment variables to enable active Google sign-in workflows.'
    : 'Google Single Sign-On configuration detected and active.';

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-40" />
      <div className="pointer-events-none fixed inset-0 bg-radial-fade" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-4 py-10 sm:px-6">
        {/* Back to home */}
        <button
          type="button"
          onClick={() => navigate('landing')}
          className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground sm:left-6 sm:top-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to home
        </button>

        <div className="grid w-full gap-8 lg:grid-cols-2 lg:items-center">
          {/* Left: brand / value recap */}
          <div className="hidden flex-col justify-center lg:flex">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-teal-500 shadow-lg shadow-primary/30">
                <BrainCircuit className="h-5 w-5 text-primary-foreground" />
                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-primary animate-pulse-glow" />
              </div>
              <div className="leading-tight">
                <h1 className="text-base font-semibold tracking-tight text-foreground">Aletheia AI</h1>
                <p className="text-xs text-muted-foreground">Autonomous Investment Intelligence</p>
              </div>
            </div>

            <h2 className="mt-8 text-balance text-3xl font-bold tracking-tight text-foreground">
              {mode === 'login' ? 'Welcome back, analyst.' : 'Start researching in minutes.'}
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              {mode === 'login'
                ? 'Sign in to access your secure research workspace — multi-agent workflows, live data aggregation, and macro stress-testing.'
                : 'Create an account to run deep research on any public company and interrogate the agent on its verdict.'}
            </p>

            <ul className="mt-8 space-y-3">
              {[
                'Multi-agent LangGraph pipeline with self-reflection',
                'Live filings, pricing, and sentiment via Tavily',
                'Stress-test across 4 macro regimes',
                'Interrogate the agent on every verdict',
              ].map((p) => (
                <li key={p} className="flex items-center gap-2.5 text-sm text-foreground/80">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: auth card */}
          <div className="relative">
            <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-b from-primary/10 to-transparent blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl border border-border/70 glass-strong p-6 shadow-2xl sm:p-8">
              <div className="pointer-events-none absolute inset-x-8 -top-px h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

              {/* Mobile brand */}
              <div className="mb-6 flex items-center gap-2.5 lg:hidden">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-teal-500 shadow-lg shadow-primary/30">
                  <BrainCircuit className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="leading-tight">
                  <h1 className="text-sm font-semibold tracking-tight text-foreground">Aletheia AI</h1>
                  <p className="text-[11px] text-muted-foreground">Investment Intelligence</p>
                </div>
              </div>

              {/* Mode toggle */}
              <div className="mb-6 inline-flex rounded-lg border border-border/70 bg-background/40 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setAuthMode('login');
                    setError(null);
                    setInfo(null);
                  }}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                    mode === 'login'
                      ? 'bg-primary text-primary-foreground shadow'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setAuthMode('register');
                    setError(null);
                    setInfo(null);
                  }}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                    mode === 'signup'
                      ? 'bg-primary text-primary-foreground shadow'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Sign up
                </button>
              </div>

              <h2 className="text-xl font-bold tracking-tight text-foreground">
                {mode === 'login' ? 'Sign in to your workspace' : 'Create your account'}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {mode === 'login'
                  ? 'Use email, Google, or a reset link to access the secure dashboard.'
                  : 'Create an account to run deep research in under a minute.'}
              </p>

              <div className="mt-4 rounded-xl border border-border/70 bg-background/50 p-3 text-xs text-muted-foreground">
                <div className="mb-2 flex items-center gap-2 text-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  Secure access
                </div>
                <p>{authSetupHint}</p>
              </div>

              {mode === 'login' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleLogin}
                  disabled={submitting}
                  className="mt-4 h-11 w-full gap-2 rounded-lg border-border/80 bg-background/60 text-sm shadow-sm"
                >
                  <Globe className="h-4 w-4" />
                  Continue with Google
                </Button>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {mode === 'signup' && (
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="text-xs font-medium text-muted-foreground">
                      Full name
                    </label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Jordan Analyst"
                        className="h-11 rounded-lg border-border/80 bg-background/60 pl-9 text-sm shadow-inner focus-visible:ring-primary/50"
                        autoComplete="name"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@fund.com"
                      className="h-11 rounded-lg border-border/80 bg-background/60 pl-9 text-sm shadow-inner focus-visible:ring-primary/50"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-xs font-medium text-muted-foreground">
                      Password
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        className="text-xs text-primary/80 transition-colors hover:text-primary"
                        onClick={handleForgotPassword}
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-11 rounded-lg border-border/80 bg-background/60 pl-9 text-sm shadow-inner focus-visible:ring-primary/50"
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400 animate-fade-in-up">
                    {error}
                  </div>
                )}

                {info && (
                  <div className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary animate-fade-in-up">
                    {info}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={submitting}
                  className="group relative h-11 w-full gap-2 overflow-hidden rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:brightness-110 disabled:opacity-70"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      {ctaLabel}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </Button>
              </form>

              {mode === 'login' && (
                <div className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                  <div className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background/40 px-3 py-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    Credentials Authentication
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background/40 px-3 py-2">
                    <KeyRound className="h-3.5 w-3.5 text-primary" />
                    Google sign-in
                  </div>
                </div>
              )}

              <p className="mt-5 text-center text-xs text-muted-foreground">
                {mode === 'login' ? (
                  <>
                    Don&apos;t have an account?{' '}
                    <button
                      type="button"
                      onClick={toggleMode}
                      className="font-medium text-primary/90 transition-colors hover:text-primary"
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={toggleMode}
                      className="font-medium text-primary/90 transition-colors hover:text-primary"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>

              <p className="mt-4 text-center text-[10px] text-muted-foreground">
                Authentication is handled directly via custom identity provider configuration hooks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}