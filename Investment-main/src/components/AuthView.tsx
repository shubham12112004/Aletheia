import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { ArrowLeft, ArrowRight, BrainCircuit, CheckCircle2, KeyRound, Loader2, Lock, Mail, ShieldCheck, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TurnstileWidget } from '@/components/TurnstileWidget';
import { useAuth } from '@/context/AuthContext';
import { postGoogleLogin, verifyTurnstile } from '@/lib/api';

type Mode = 'login' | 'signup';
const trustPoints = ['Live market intelligence', 'Evidence-backed reports', 'Private research workspace'];

export function AuthView() {
  const { authMode, setAuthMode, setSession, navigate } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileKey, setTurnstileKey] = useState(0);
  const turnstileSiteKey = import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITEKEY as string | undefined;
  const hasGoogleConfig = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const canSubmit = Boolean(turnstileSiteKey && turnstileToken && !submitting);
  const ctaLabel = useMemo(() => (mode === 'login' ? 'Enter workspace' : 'Create workspace'), [mode]);

  useEffect(() => setMode(authMode === 'register' ? 'signup' : 'login'), [authMode]);

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode); setAuthMode(nextMode === 'login' ? 'login' : 'register'); setError(null); setTurnstileToken(''); setTurnstileKey((value) => value + 1);
  };

  const establishSession = (nextEmail: string, nextName?: string) => {
    const displayName = nextName?.trim() || nextEmail.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());
    setSession({ token: `tok_${crypto.randomUUID()}`, user: { email: nextEmail, name: displayName || 'Analyst', provider: 'email' } });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault(); setError(null);
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError('Enter a valid email address.');
    if (password.length < 6) return setError('Password must contain at least 6 characters.');
    if (mode === 'signup' && !name.trim()) return setError('Enter your full name.');
    if (!turnstileSiteKey || !turnstileToken) return setError('Complete the Cloudflare security check to continue.');
    setSubmitting(true);
    try { await verifyTurnstile(turnstileToken); establishSession(email.trim(), mode === 'signup' ? name : undefined); }
    catch (requestError) { setTurnstileToken(''); setTurnstileKey((value) => value + 1); setError(requestError instanceof Error ? requestError.message : 'Secure sign-in could not be completed.'); }
    finally { setSubmitting(false); }
  };

  const handleGoogleCredential = async (credentialResponse: CredentialResponse) => {
    if (!hasGoogleConfig) return setError('Google sign-in is not configured for this environment.');
    if (!turnstileToken) return setError('Complete the Cloudflare security check before continuing with Google.');
    if (!credentialResponse.credential) return setError('Google did not return an identity token. Please try again.');
    setSubmitting(true);
    try {
      const session = await postGoogleLogin(credentialResponse.credential, turnstileToken);
      setSession({ token: session.token, user: { email: session.user.email, name: session.user.name || session.user.email.split('@')[0], provider: 'google' } });
    } catch (requestError) {
      setTurnstileToken(''); setTurnstileKey((value) => value + 1);
      setError(requestError instanceof Error ? requestError.message : 'Google sign-in could not be completed.');
    } finally { setSubmitting(false); }
  };

  return <main className="min-h-screen bg-[#08111f] px-4 py-5 text-slate-900 sm:p-8"><div className="mx-auto grid min-h-[calc(100vh-40px)] max-w-6xl overflow-hidden rounded-[28px] border border-white/10 bg-white shadow-2xl shadow-black/35 lg:grid-cols-[1.05fr_0.95fr]">
    <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#0a1e3a] via-[#0b3260] to-[#047b86] p-10 text-white lg:flex lg:flex-col"><div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-cyan-300/15 blur-3xl" /><div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-blue-500/25 blur-3xl" /><div className="relative flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-blue-700 shadow-lg"><BrainCircuit className="h-6 w-6" /></div><div><p className="text-base font-black tracking-tight">Aletheia AI</p><p className="text-xs text-cyan-100/75">Investment intelligence workspace</p></div></div><div className="relative my-auto max-w-md"><p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">Research with conviction</p><h1 className="mt-4 text-5xl font-black leading-[1.02] tracking-tight">Turn market noise into a defensible view.</h1><p className="mt-5 text-base leading-7 text-blue-100/85">Live market data, current evidence, and an AI research workflow in one focused decision desk.</p><div className="mt-9 space-y-3">{trustPoints.map((point) => <div key={point} className="flex items-center gap-3 text-sm font-semibold text-white"><span className="grid h-7 w-7 place-items-center rounded-full bg-white/10 ring-1 ring-white/20"><CheckCircle2 className="h-4 w-4 text-cyan-200" /></span>{point}</div>)}</div></div><div className="relative flex items-center gap-2 text-xs text-cyan-100/70"><ShieldCheck className="h-4 w-4" />Secure access powered by Cloudflare Turnstile</div></section>
    <section className="relative flex flex-col justify-center bg-[#f8fafc] p-6 sm:p-10 lg:p-12"><button type="button" onClick={() => navigate('landing')} className="absolute left-5 top-5 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 transition hover:text-blue-700"><ArrowLeft className="h-4 w-4" />Back to home</button><div className="mx-auto w-full max-w-sm"><div className="mb-8 flex items-center gap-3 lg:hidden"><div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white"><BrainCircuit className="h-5 w-5" /></div><div><p className="font-black text-slate-950">Aletheia AI</p><p className="text-xs text-slate-500">Investment intelligence</p></div></div><div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">{(['login', 'signup'] as const).map((item) => <button key={item} type="button" onClick={() => switchMode(item)} className={`rounded-lg px-4 py-2 text-sm font-bold transition ${mode === item ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-500 hover:text-slate-950'}`}>{item === 'login' ? 'Sign in' : 'Create account'}</button>)}</div><h2 className="mt-7 text-3xl font-black tracking-tight text-slate-950">{mode === 'login' ? 'Welcome back.' : 'Build your research desk.'}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{mode === 'login' ? 'Sign in to access your saved company research and live workspace.' : 'Create an account to begin researching public companies.'}</p>
      <form onSubmit={handleSubmit} className="mt-7 space-y-4">{mode === 'signup' && <Field label="Full name" icon={<User className="h-4 w-4" />}><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Jordan Analyst" autoComplete="name" className="h-12 border-slate-200 bg-white pl-10 shadow-sm" /></Field>}<Field label="Email address" icon={<Mail className="h-4 w-4" />}><Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@fund.com" autoComplete="email" className="h-12 border-slate-200 bg-white pl-10 shadow-sm" /></Field><Field label="Password" icon={<Lock className="h-4 w-4" />}><Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} className="h-12 border-slate-200 bg-white pl-10 shadow-sm" /></Field>{turnstileSiteKey ? <TurnstileWidget key={turnstileKey} siteKey={turnstileSiteKey} onToken={setTurnstileToken} onError={setError} /> : <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">Cloudflare Turnstile is not configured.</p>}{error && <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{error}</p>}<Button type="submit" disabled={!canSubmit} className="h-12 w-full rounded-xl bg-blue-600 text-sm font-black text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700">{submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Securing access</> : <>{ctaLabel}<ArrowRight className="ml-2 h-4 w-4" /></>}</Button></form>
      <div className="my-5 flex items-center gap-3 text-xs text-slate-400 before:h-px before:flex-1 before:bg-slate-200 after:h-px after:flex-1 after:bg-slate-200">or</div><div className="flex min-h-10 justify-center">{canSubmit ? <GoogleLogin onSuccess={handleGoogleCredential} onError={() => setError('Google sign-in was cancelled or unavailable.')} theme="outline" size="large" text={mode === 'signup' ? 'signup_with' : 'signin_with'} shape="rectangular" width="320" /> : <p className="text-xs font-semibold text-slate-400">Complete Cloudflare verification to enable Google {mode === 'signup' ? 'sign-up' : 'sign-in'}.</p>}</div><div className="mt-7 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500"><KeyRound className="h-3.5 w-3.5 text-blue-600" />Protected by Cloudflare Turnstile</div></div></section>
  </div></main>;
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) { return <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-700">{label}</span><span className="relative block"><span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400">{icon}</span>{children}</span></label>; }