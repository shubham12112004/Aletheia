import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import {
  ArrowLeft, ArrowRight, BrainCircuit, KeyRound, Loader2,
  Lock, Mail, ShieldCheck, Sparkles, TrendingUp, User, Zap, CheckCircle2,
  Eye, EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TurnstileWidget } from '@/components/TurnstileWidget';
import { useAuth } from '@/context/AuthContext';
import { postGoogleLogin, postSignup, postEmailLogin, postForgotPassword, postVerifyOTP } from '@/lib/api';

type Mode = 'login' | 'signup' | 'forgot';

const features = [
  { icon: TrendingUp, label: 'Live market intelligence', desc: 'Real-time financial data from global markets' },
  { icon: Zap, label: 'Evidence-backed reports', desc: 'AI analysis grounded in verifiable sources' },
  { icon: ShieldCheck, label: 'Private research workspace', desc: 'Your research, secured and private' },
];

const stats = [
  { value: '11', label: 'AI Nodes' },
  { value: '< 90s', label: 'Per Report' },
  { value: '6+', label: 'Data Sources' },
];

export function AuthView() {
  const { authMode, setAuthMode, setSession, navigate } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileKey, setTurnstileKey] = useState(0);
  // OTP forgot-password state
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const turnstileSiteKey = import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITEKEY as string | undefined;
  const hasGoogleConfig = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const canSubmit = Boolean(turnstileSiteKey && turnstileToken && !submitting);
  
  const ctaLabel = useMemo(() => {
    if (mode === 'login') return 'Enter workspace';
    if (mode === 'signup') return 'Create workspace';
    return 'Send reset password';
  }, [mode]);

  useEffect(() => {
    setMode(authMode === 'register' ? 'signup' : authMode === 'reset' ? 'forgot' : 'login');
  }, [authMode]);

  // Animated particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; a: number }[] = [];
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        a: Math.random(),
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(52, 211, 153, ${p.a * 0.4})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode);
    setAuthMode(nextMode === 'login' ? 'login' : nextMode === 'signup' ? 'register' : 'reset');
    setError(null);
    setSuccessMsg(null);
    setOtpSent(false);
    setOtp('');
    setNewPassword('');
    setTurnstileToken('');
    setTurnstileKey((v) => v + 1);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // ── Step 2: OTP verify ──
    if (mode === 'forgot' && otpSent) {
      if (otp.length !== 6) return setError('Enter the 6-digit OTP sent to your email.');
      if (newPassword.length < 6) return setError('New password must be at least 6 characters.');
      setSubmitting(true);
      try {
        await postVerifyOTP({ email: email.trim(), otp, newPassword });
        setSuccessMsg('Password reset successfully! You can now sign in with your new password.');
        setTimeout(() => switchMode('login'), 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'OTP verification failed.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError('Enter a valid email address.');
    if (mode !== 'forgot' && password.length < 6) return setError('Password must contain at least 6 characters.');
    if (mode === 'signup' && password !== confirmPassword) return setError('Passwords do not match.');
    if (mode === 'signup' && !name.trim()) return setError('Enter your full name.');
    if (!turnstileSiteKey || !turnstileToken) return setError('Complete the Cloudflare security check to continue.');
    setSubmitting(true);

    try {
      if (mode === 'signup') {
        const res = await postSignup({ name: name.trim(), email: email.trim(), password, turnstileToken });
        setSession({ token: res.token, user: { email: res.user.email, name: res.user.name, provider: 'email' } });
      } else if (mode === 'login') {
        const res = await postEmailLogin({ email: email.trim(), password, turnstileToken });
        setSession({ token: res.token, user: { email: res.user.email, name: res.user.name, provider: 'email' } });
      } else {
        // Step 1: send OTP
        await postForgotPassword({ email: email.trim(), turnstileToken });
        setOtpSent(true);
        setSuccessMsg(`A 6-digit reset code has been sent to ${email.trim()}. Check your inbox.`);
      }
    } catch (err) {
      setTurnstileToken('');
      setTurnstileKey((v) => v + 1);
      setError(err instanceof Error ? err.message : 'Secure access could not be completed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleCredential = async (credentialResponse: CredentialResponse) => {
    if (!hasGoogleConfig) return setError('Google sign-in is not configured for this environment.');
    if (!turnstileToken) return setError('Complete the Cloudflare security check before continuing with Google.');
    if (!credentialResponse.credential) return setError('Google did not return an identity token. Please try again.');
    setSubmitting(true);
    try {
      const session = await postGoogleLogin(credentialResponse.credential, turnstileToken);
      setSession({ token: session.token, user: { email: session.user.email, name: session.user.name || session.user.email.split('@')[0], provider: 'google' } });
    } catch (err) {
      setTurnstileToken('');
      setTurnstileKey((v) => v + 1);
      setError(err instanceof Error ? err.message : 'Google sign-in could not be completed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05080f]">
      {/* Aurora background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-mesh-drift absolute -left-32 -top-32 h-[600px] w-[600px] rounded-full bg-emerald-500/8 blur-[120px]" />
        <div className="animate-mesh-drift absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-blue-500/8 blur-[120px]" style={{ animationDelay: '-7s' }} />
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-emerald-400/5 blur-[100px]" />
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-grid opacity-40" />
      </div>

      {/* Particle canvas */}
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full opacity-60" />

      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        type="button"
        onClick={() => navigate('landing')}
        className="absolute left-5 top-5 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-400 backdrop-blur-sm transition hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-400"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to home
      </motion.button>

      <div className="relative z-10 mx-auto grid min-h-screen max-w-[1200px] px-4 lg:grid-cols-[1fr_460px] lg:gap-16 lg:px-12 xl:gap-24">

        {/* LEFT — Branding panel */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="hidden flex-col justify-center py-16 lg:flex"
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/30">
              <BrainCircuit className="h-6 w-6 text-white" />
              <div className="absolute inset-0 rounded-2xl ring-1 ring-emerald-400/30" />
            </div>
            <div>
              <p className="text-base font-black tracking-tight text-white">Aletheia AI</p>
              <p className="text-xs text-zinc-500">Investment intelligence workspace</p>
            </div>
          </div>

          {/* Headline */}
          <div className="mt-14">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xs font-bold uppercase tracking-[0.28em] text-emerald-500"
            >
              Research with conviction
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-4 text-[3.2rem] font-black leading-[1.02] tracking-tight text-white"
            >
              Turn market noise<br />into a{' '}
              <span className="text-gradient-emerald">defensible view.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-5 max-w-md text-base leading-7 text-zinc-400"
            >
              Live market data, current evidence, and an AI research workflow in one focused decision desk.
            </motion.p>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="mt-10 flex items-center gap-8"
          >
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-black text-emerald-400">{s.value}</p>
                <p className="mt-0.5 text-xs font-semibold text-zinc-500">{s.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Feature list */}
          <div className="mt-10 space-y-3">
            {features.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
                className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/3 p-3.5 backdrop-blur-sm"
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                  <f.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{f.label}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Security tag */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-10 flex items-center gap-2 text-xs text-zinc-600"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Secured by Cloudflare Turnstile
          </motion.div>
        </motion.div>

        {/* RIGHT — Auth card */}
        <div className="flex items-center justify-center py-10 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[420px]"
          >
            {/* Card glass panel */}
            <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-white/4 p-7 shadow-[0_30px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:p-9">
              {/* Gradient top edge */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

              {/* Mobile logo */}
              <div className="mb-7 flex items-center gap-3 lg:hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/30">
                  <BrainCircuit className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-black text-white">Aletheia AI</p>
                  <p className="text-xs text-zinc-500">Investment intelligence</p>
                </div>
              </div>

              {/* Mode tabs */}
              <div className="inline-flex w-full rounded-2xl border border-white/8 bg-white/4 p-1">
                {(['login', 'signup'] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => switchMode(item)}
                    className={`flex-1 rounded-xl py-2 text-sm font-bold transition-all duration-200 ${mode === item ? 'bg-emerald-500 text-[#05080f] shadow-md shadow-emerald-500/30' : 'text-zinc-500 hover:text-zinc-300'}`}
                  >
                    {item === 'login' ? 'Sign in' : 'Create account'}
                  </button>
                ))}
              </div>

              {/* Headline */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="mt-7"
                >
                  <h2 className="text-2xl font-black tracking-tight text-white">
                    {mode === 'login' ? 'Welcome back.' : mode === 'signup' ? 'Build your research desk.' : 'Reset your password.'}
                  </h2>
                  <p className="mt-1.5 text-sm leading-6 text-zinc-500">
                    {mode === 'login'
                      ? 'Sign in to access your saved company research and live workspace.'
                      : mode === 'signup'
                      ? 'Create an account to begin researching public companies.'
                      : 'Enter your email address and we will generate a temporary login password.'}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Success message popup */}
              <AnimatePresence>
                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-bold text-emerald-400 flex items-start gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{successMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {mode === 'signup' && (
                  <AuthField label="Full name" icon={<User className="h-4 w-4" />}>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jordan Analyst"
                      autoComplete="name"
                      style={{ color: '#ffffff', backgroundColor: 'rgba(9, 14, 23, 0.7)' }}
                      className="h-12 rounded-xl border-white/10 pl-10 text-white placeholder:text-zinc-600 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/30"
                    />
                  </AuthField>
                )}
                <AuthField label="Email address" icon={<Mail className="h-4 w-4" />}>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@fund.com"
                    autoComplete="email"
                    style={{ color: '#ffffff', backgroundColor: 'rgba(9, 14, 23, 0.7)' }}
                    className="h-12 rounded-xl border-white/10 pl-10 text-white placeholder:text-zinc-600 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/30"
                  />
                </AuthField>

                {mode !== 'forgot' && (
                  <>
                    <AuthField label="Password" icon={<Lock className="h-4 w-4" />}>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                          style={{ color: '#ffffff', backgroundColor: 'rgba(9, 14, 23, 0.7)' }}
                          className="h-12 w-full rounded-xl border-white/10 pl-10 pr-10 text-white placeholder:text-zinc-600 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/30"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-emerald-400 focus:outline-none transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </AuthField>
                    
                    {mode === 'signup' && (
                      <AuthField label="Confirm Password" icon={<Lock className="h-4 w-4" />}>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            style={{ color: '#ffffff', backgroundColor: 'rgba(9, 14, 23, 0.7)' }}
                            className="h-12 w-full rounded-xl border-white/10 pl-10 pr-10 text-white placeholder:text-zinc-600 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/30"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-emerald-400 focus:outline-none transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </AuthField>
                    )}
                  </>
                )}

                {mode === 'login' && (
                  <div className="flex justify-end mt-1">
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Forgot password – 2-step OTP UI */}
                {mode === 'forgot' && otpSent && (
                  <>
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-4 py-3 text-xs font-semibold text-emerald-400">
                      📧 Code sent to <span className="font-black text-white">{email}</span>. Enter it below.
                    </div>

                    <AuthField label="6-Digit OTP Code" icon={<KeyRound className="h-4 w-4" />}>
                      <Input
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="123456"
                        maxLength={6}
                        inputMode="numeric"
                        style={{ color: '#ffffff', backgroundColor: 'rgba(9,14,23,0.7)', letterSpacing: '8px', fontSize: '20px' }}
                        className="h-12 rounded-xl border-white/10 pl-10 text-white placeholder:text-zinc-600 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/30 text-center"
                      />
                    </AuthField>

                    <AuthField label="New Password" icon={<Lock className="h-4 w-4" />}>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          style={{ color: '#ffffff', backgroundColor: 'rgba(9,14,23,0.7)' }}
                          className="h-12 w-full rounded-xl border-white/10 pl-10 pr-10 text-white placeholder:text-zinc-600 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/30"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-emerald-400 focus:outline-none transition-colors"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </AuthField>

                    <button
                      type="button"
                      onClick={() => { setOtpSent(false); setOtp(''); setNewPassword(''); setError(null); setSuccessMsg(null); }}
                      className="text-xs font-semibold text-zinc-500 hover:text-emerald-400 transition"
                    >
                      ← Resend code or change email
                    </button>
                  </>
                )}

                {mode === 'forgot' && !otpSent && (
                  <div className="flex justify-end mt-1">
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
                    >
                      Return to sign in
                    </button>
                  </div>
                )}

                {!(mode === 'forgot' && otpSent) && (turnstileSiteKey ? (
                  <TurnstileWidget key={turnstileKey} siteKey={turnstileSiteKey} onToken={setTurnstileToken} onError={setError} />
                ) : (
                  <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400">
                    Cloudflare Turnstile is not configured.
                  </p>
                ))}

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <Button
                  type="submit"
                  disabled={(mode === 'forgot' && otpSent) ? submitting : !canSubmit}
                  className="group h-12 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-sm font-black text-[#05080f] shadow-lg shadow-emerald-500/25 transition hover:from-emerald-400 hover:to-emerald-500 hover:shadow-emerald-500/40 disabled:opacity-40"
                >
                  {submitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing request</>
                  ) : (
                    <><Sparkles className="mr-2 h-4 w-4" />{ctaLabel}<ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" /></>
                  )}
                </Button>
              </form>

              {/* Divider + Google — hidden on forgot OTP step */}
              {!(mode === 'forgot' && otpSent) && (
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/8" />
                  <span className="text-xs font-semibold text-zinc-600">or continue with</span>
                  <div className="h-px flex-1 bg-white/8" />
                </div>
              )}

              {/* Google */}
              <div className="flex min-h-10 justify-center">

                {canSubmit ? (
                  <GoogleLogin
                    onSuccess={handleGoogleCredential}
                    onError={() => setError('Google sign-in was cancelled or unavailable.')}
                    theme="filled_black"
                    size="large"
                    text={mode === 'signup' ? 'signup_with' : 'signin_with'}
                    shape="rectangular"
                    width="340"
                  />
                ) : (
                  <p className="text-xs font-semibold text-zinc-600">
                    Complete Cloudflare verification to enable Google authentication.
                  </p>
                )}
              </div>

              {/* Footer tag */}
              <div className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-zinc-600">
                <KeyRound className="h-3.5 w-3.5 text-emerald-600" />
                Protected by Cloudflare Turnstile
              </div>


              {/* Bottom gradient edge */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

function AuthField({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-zinc-400">{label}</span>
      <span className="relative block">
        <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-zinc-500">{icon}</span>
        {children}
      </span>
    </label>
  );
}