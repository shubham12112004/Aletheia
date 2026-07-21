import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import {
  ArrowLeft, KeyRound, Loader2,
  Lock, Mail, ShieldCheck, TrendingUp, User, Zap, CheckCircle2,
  Eye, EyeOff, XCircle, ChevronRight, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TurnstileWidget } from '@/components/TurnstileWidget';
import { useAuth } from '@/context/AuthContext';
import { postGoogleLogin, postSignup, postEmailLogin, postForgotPassword, postVerifyOTP } from '@/lib/api';
import { cn } from '@/lib/utils';

type Mode = 'login' | 'signup' | 'forgot';

const features = [
  { icon: TrendingUp, label: 'Real-Time Market Intelligence', desc: 'Direct stream from NASDAQ, NYSE, and global exchanges.' },
  { icon: Zap, label: 'Deterministic AI Swarms', desc: 'Evidence-grounded quantitative valuation algorithms.' },
  { icon: ShieldCheck, label: 'Encrypted Vault', desc: 'Institutional security with zero-knowledge data privacy.' },
];

const getPasswordStrength = (password: string) => {
  if (!password) return { score: 0, label: '', color: 'bg-zinc-800' };
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score === 1) return { score, label: 'Weak', color: 'bg-rose-500' };
  if (score === 2) return { score, label: 'Fair', color: 'bg-amber-500' };
  if (score >= 3) return { score, label: 'Strong', color: 'bg-emerald-500' };
  return { score: 0, label: '', color: 'bg-zinc-800' };
};

const getFriendlyError = (errMessage: string) => {
  const msg = errMessage.toLowerCase();
  if (msg.includes('user not found') || msg.includes('invalid credentials') || msg.includes('invalid email address or password'))
    return 'Invalid email address or password. Please try again.';
  if (msg.includes('already exists')) return 'An account with this email already exists. Try signing in instead.';
  if (msg.includes('turnstile')) return 'Security verification failed. Please refresh the page.';
  if (msg.includes('network')) return 'Network error. Please check your internet connection.';
  return errMessage;
};

export function AuthView() {
  const { authMode, setAuthMode, setSession, navigate } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileKey, setTurnstileKey] = useState(0);

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const turnstileSiteKey = import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITEKEY as string | undefined;
  const hasGoogleConfig = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const isTurnstileVerified = !turnstileSiteKey || Boolean(turnstileToken);
  const canSubmit = Boolean(isTurnstileVerified && !submitting);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPasswordValid = password.length >= 6;
  const isConfirmValid = password === confirmPassword && confirmPassword.length > 0;
  const isNameValid = name.trim().length > 1;
  const pwStrength = getPasswordStrength(password);

  const ctaLabel = useMemo(() => {
    if (mode === 'login') return 'Sign in to Workspace';
    if (mode === 'signup') return 'Create Account';
    return 'Send Recovery Code';
  }, [mode]);

  useEffect(() => {
    setMode(authMode === 'register' ? 'signup' : authMode === 'reset' ? 'forgot' : 'login');
  }, [authMode]);

  useEffect(() => {
    if (!submitting) return;
    const texts = [
      'Authenticating credentials...',
      'Verifying session encryption...',
      'Initializing AI research workspace...',
    ];
    let i = 0;
    setLoadingText(texts[0]);
    const interval = setInterval(() => {
      i = (i + 1) % texts.length;
      setLoadingText(texts[i]);
    }, 1800);
    return () => clearInterval(interval);
  }, [submitting]);

  // Particle canvas effect
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

    for (let i = 0; i < 45; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        r: Math.random() * 1.8 + 0.4,
        a: Math.random() * 0.8 + 0.2,
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
        ctx.fillStyle = `rgba(16, 185, 129, ${p.a * 0.25})`;
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

    if (mode === 'forgot' && otpSent) {
      if (otp.length !== 6) return setError('Please enter the 6-digit verification code.');
      if (newPassword.length < 6) return setError('Your new password must be at least 6 characters.');
      setSubmitting(true);
      try {
        await postVerifyOTP({ email: email.trim(), otp, newPassword });
        setSuccessMsg('Your password has been reset successfully.');
        setTimeout(() => switchMode('login'), 2000);
      } catch (err) {
        setError(getFriendlyError(err instanceof Error ? err.message : 'Verification failed.'));
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!isEmailValid) return setError('Please enter a valid email address.');
    if (mode !== 'forgot' && !isPasswordValid) return setError('Password must be at least 6 characters.');
    if (mode === 'signup' && !isConfirmValid) return setError('Passwords do not match.');
    if (mode === 'signup' && !isNameValid) return setError('Please enter your full name.');
    if (!turnstileSiteKey || !turnstileToken) return setError('Security verification incomplete. Please wait a moment.');

    setSubmitting(true);

    try {
      if (mode === 'signup') {
        const res = await postSignup({ name: name.trim(), email: email.trim(), password, turnstileToken });
        setSession({ token: res.token, user: { email: res.user.email, name: res.user.name, provider: 'email' } });
      } else if (mode === 'login') {
        const res = await postEmailLogin({ email: email.trim(), password, turnstileToken });
        setSession({ token: res.token, user: { email: res.user.email, name: res.user.name, provider: 'email' } });
      } else {
        await postForgotPassword({ email: email.trim(), turnstileToken });
        setOtpSent(true);
        setSuccessMsg(`We've sent a 6-digit recovery code to ${email.trim()}.`);
      }
    } catch (err) {
      setTurnstileToken('');
      setTurnstileKey((v) => v + 1);
      setError(getFriendlyError(err instanceof Error ? err.message : 'Authentication failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleCredential = async (credentialResponse: CredentialResponse) => {
    if (!hasGoogleConfig) return setError('Google sign-in is currently unavailable.');
    if (!turnstileToken) return setError('Please complete the security check above first.');
    if (!credentialResponse.credential) return setError('Google authentication failed.');

    setSubmitting(true);
    setLoadingText('Connecting to Google...');
    try {
      const session = await postGoogleLogin(credentialResponse.credential, turnstileToken);
      setSession({ token: session.token, user: { email: session.user.email, name: session.user.name || session.user.email.split('@')[0], provider: 'google' } });
    } catch (err) {
      setTurnstileToken('');
      setTurnstileKey((v) => v + 1);
      setError(getFriendlyError(err instanceof Error ? err.message : 'Google authentication failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05080f] text-foreground font-sans selection:bg-emerald-500/30">

      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -left-[15%] -top-[15%] h-[900px] w-[900px] rounded-full bg-emerald-500/10 blur-[160px] mix-blend-screen" />
        <div className="absolute -bottom-[25%] -right-[15%] h-[800px] w-[800px] rounded-full bg-teal-600/10 blur-[160px] mix-blend-screen" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-emerald-600/5 blur-[140px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/20 via-[#05080f] to-[#05080f]" />
      </div>

      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 h-full w-full opacity-35 mix-blend-screen z-0" />

      {/* Top Bar / Back button */}
      <div className="relative z-20 mx-auto flex max-w-[1400px] items-center justify-between px-6 py-6 lg:px-8">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          type="button"
          onClick={() => navigate('landing')}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-zinc-300 backdrop-blur-xl transition-all hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-400 shadow-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to platform
        </motion.button>
      </div>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-88px)] max-w-[1400px] px-6 lg:grid-cols-2 lg:gap-12 xl:gap-20 lg:px-8 items-center pb-12">

        {/* LEFT — Institutional Brand Panel */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="hidden flex-col justify-center lg:flex relative py-8"
        >
          {/* Animated Logo & Brand */}
          <div className="flex items-center gap-4 mb-14">
            <img src="/favicon.svg" alt="Aletheia Logo" className="h-14 w-14 rounded-2xl shadow-xl shadow-emerald-500/25 animate-pulse" />
            <div>
              <p className="text-2xl font-black tracking-tight text-white font-mono">Aletheia</p>
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Institutional AI Intelligence</p>
            </div>
          </div>

          {/* Value Prop Headline */}
          <div className="max-w-xl">
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-5xl xl:text-6xl font-black leading-[1.08] tracking-tight text-white mb-6"
            >
              Equity analysis <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-200">
                engineered for precision.
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-base leading-relaxed text-zinc-400 font-medium max-w-lg"
            >
              Empowering financial analysts with live market telemetry, automated fundamental scoring, and verifiably sourced AI research.
            </motion.p>
          </div>

          {/* Feature List */}
          <div className="mt-12 space-y-3 max-w-lg">
            {features.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur-xl transition-all hover:bg-white/[0.04] hover:border-white/10"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner">
                  <f.icon className="h-5 w-5 stroke-[1.75]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-100">{f.label}</p>
                  <p className="text-xs text-zinc-400 font-medium mt-0.5">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT — Premium Glassmorphism Card */}
        <div className="flex items-center justify-center relative py-4">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[440px]"
          >
            {/* Main Card */}
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#090d16]/85 p-8 shadow-2xl shadow-black/80 backdrop-blur-3xl sm:p-10">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
              <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />

              {/* Mobile Header Logo */}
              <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
                <img src="/favicon.svg" alt="Aletheia Logo" className="h-11 w-11 rounded-xl shadow-lg shadow-emerald-500/30" />
                <div className="text-left">
                  <p className="font-black text-white text-xl font-mono">Aletheia</p>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">Research Workspace</p>
                </div>
              </div>

              {/* Mode Tabs */}
              <div className="mb-8 flex rounded-2xl border border-white/10 bg-black/50 p-1.5 shadow-inner">
                {(['login', 'signup'] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => switchMode(item)}
                    className={cn(
                      'flex-1 rounded-xl py-2.5 text-xs font-bold transition-all duration-300',
                      mode === item
                        ? 'bg-zinc-800/90 text-white shadow-md ring-1 ring-white/15'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                    )}
                  >
                    {item === 'login' ? 'Sign In' : 'Create Account'}
                  </button>
                ))}
              </div>

              {/* Headline */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="mb-6"
                >
                  <h2 className="text-2xl font-black tracking-tight text-white mb-1.5">
                    {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create your workspace' : 'Reset your password'}
                  </h2>
                  <p className="text-xs font-medium leading-relaxed text-zinc-400">
                    {mode === 'login'
                      ? 'Enter your credentials to access your financial research terminal.'
                      : mode === 'signup'
                      ? 'Join Aletheia to access institutional AI equity evaluation tools.'
                      : 'Enter your email address to receive a 6-digit recovery code.'}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Success Notification */}
              <AnimatePresence>
                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="mb-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-400 flex items-start gap-3 shadow-inner"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                    <span className="leading-snug">{successMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Notification */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="mb-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-bold text-rose-400 flex items-start gap-3 shadow-inner"
                  >
                    <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span className="leading-snug">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <AuthField label="Full Name" icon={<User className="h-4 w-4" />} isValid={isNameValid} value={name}>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Doe"
                      autoComplete="name"
                      className="h-11 w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus-visible:border-emerald-500/50 focus-visible:ring-2 focus-visible:ring-emerald-500/20 transition-all font-medium"
                    />
                  </AuthField>
                )}

                <AuthField label="Email Address" icon={<Mail className="h-4 w-4" />} isValid={isEmailValid} value={email}>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="analyst@firm.com"
                    autoComplete="email"
                    className="h-11 w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus-visible:border-emerald-500/50 focus-visible:ring-2 focus-visible:ring-emerald-500/20 transition-all font-medium"
                  />
                </AuthField>

                {mode !== 'forgot' && (
                  <div className="space-y-4">
                    <AuthField label="Password" icon={<Lock className="h-4 w-4" />} isValid={isPasswordValid} value={password}>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                          className="h-11 w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-10 text-sm text-white placeholder:text-zinc-600 focus-visible:border-emerald-500/50 focus-visible:ring-2 focus-visible:ring-emerald-500/20 transition-all font-medium font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200 focus:outline-none transition-colors p-1"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </AuthField>

                    {/* Password Strength (Signup only) */}
                    {mode === 'signup' && password.length > 0 && (
                      <div className="space-y-1.5 mt-1">
                        <div className="flex justify-between items-center text-[11px] font-bold">
                          <span className="text-zinc-500">Password Strength</span>
                          <span className={cn(
                            pwStrength.score < 2 ? "text-rose-400" : pwStrength.score === 2 ? "text-amber-400" : "text-emerald-400"
                          )}>{pwStrength.label}</span>
                        </div>
                        <div className="flex gap-1 h-1">
                          {[1, 2, 3].map((level) => (
                            <div key={level} className={cn("flex-1 rounded-full transition-all duration-300", password.length > 0 && level <= pwStrength.score ? pwStrength.color : "bg-white/10")} />
                          ))}
                        </div>
                      </div>
                    )}

                    {mode === 'signup' && (
                      <AuthField label="Confirm Password" icon={<Lock className="h-4 w-4" />} isValid={isConfirmValid} value={confirmPassword}>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            className="h-11 w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-10 text-sm text-white placeholder:text-zinc-600 focus-visible:border-emerald-500/50 focus-visible:ring-2 focus-visible:ring-emerald-500/20 transition-all font-medium font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200 focus:outline-none transition-colors p-1"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </AuthField>
                    )}
                  </div>
                )}

                {/* Remember Me & Forgot Password */}
                {mode === 'login' && (
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div
                        onClick={() => setRememberMe(!rememberMe)}
                        className={cn(
                          "h-4 w-4 rounded border flex items-center justify-center transition-all",
                          rememberMe ? "bg-emerald-500 border-emerald-500 text-white" : "border-white/20 bg-black/40 group-hover:border-white/40"
                        )}
                      >
                        {rememberMe && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                      <span className="text-xs font-semibold text-zinc-400 group-hover:text-zinc-300 transition-colors">Remember me</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Forgot password OTP flow */}
                {mode === 'forgot' && otpSent && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-2">
                    <AuthField label="6-Digit Verification Code" icon={<KeyRound className="h-4 w-4" />} isValid={otp.length === 6} value={otp}>
                      <Input
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="123456"
                        maxLength={6}
                        inputMode="numeric"
                        className="h-12 w-full rounded-xl border border-white/10 bg-black/40 pl-10 text-center text-xl font-black tracking-[0.4em] text-white placeholder:text-zinc-700 focus-visible:border-emerald-500/50 focus-visible:ring-2 focus-visible:ring-emerald-500/20 transition-all font-mono"
                      />
                    </AuthField>

                    <AuthField label="New Secure Password" icon={<Lock className="h-4 w-4" />} isValid={newPassword.length >= 6} value={newPassword}>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          className="h-11 w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-10 text-sm text-white placeholder:text-zinc-600 focus-visible:border-emerald-500/50 focus-visible:ring-2 focus-visible:ring-emerald-500/20 transition-all font-medium font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200 focus:outline-none transition-colors p-1"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </AuthField>

                    <button
                      type="button"
                      onClick={() => { setOtpSent(false); setOtp(''); setNewPassword(''); setError(null); setSuccessMsg(null); }}
                      className="text-xs font-bold text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
                    >
                      <ArrowLeft className="h-3 w-3" /> Resend code or change email
                    </button>
                  </motion.div>
                )}

                {mode === 'forgot' && !otpSent && (
                  <div className="flex justify-start pt-1">
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="text-xs font-bold text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
                    >
                      <ArrowLeft className="h-3 w-3" /> Return to sign in
                    </button>
                  </div>
                )}

                {/* Cloudflare Turnstile */}
                {!(mode === 'forgot' && otpSent) && (
                  <div className="pt-2 flex justify-center">
                    {turnstileSiteKey ? (
                      <TurnstileWidget key={turnstileKey} siteKey={turnstileSiteKey} onToken={setTurnstileToken} onError={setError} />
                    ) : (
                      <p className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-400 flex items-center gap-2 w-full justify-center">
                        <ShieldCheck className="h-4 w-4" /> Security verification misconfigured.
                      </p>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={!canSubmit || submitting}
                  className="group relative h-12 w-full overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/20 transition-all hover:from-emerald-400 hover:to-teal-500 hover:shadow-emerald-500/35 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 text-sm mt-3"
                >
                  <div className="relative flex items-center justify-center gap-2 w-full h-full">
                    {submitting ? (
                      <AnimatePresence mode="wait">
                        <motion.div key={loadingText} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                          <span>{loadingText}</span>
                        </motion.div>
                      </AnimatePresence>
                    ) : (
                      <>
                        {ctaLabel}
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </div>
                </Button>
              </form>

              {/* Divider */}
              {!(mode === 'forgot' && otpSent) && (
                <div className="mt-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Or continue with</span>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
                </div>
              )}

              {/* Google OAuth Button */}
              {!(mode === 'forgot' && otpSent) && (
                <div className="mt-5 flex justify-center w-full">
                  <div className={cn(
                    "w-full flex justify-center rounded-xl overflow-hidden shadow-md border border-white/10 transition-all bg-black",
                    isTurnstileVerified ? "hover:border-white/20" : "pointer-events-none opacity-40"
                  )}>
                    <GoogleLogin
                      onSuccess={handleGoogleCredential}
                      onError={() => setError('Google sign-in cancelled.')}
                      theme="filled_black"
                      size="large"
                      text={mode === 'signup' ? 'signup_with' : 'signin_with'}
                      shape="rectangular"
                      width="360"
                    />
                  </div>
                </div>
              )}

              {/* Security Badge Footer */}
              <div className="mt-8 flex items-center justify-center gap-1.5 text-[11px] font-bold text-zinc-500">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                Protected by 256-bit SSL & Cloudflare Turnstile
              </div>

            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

function AuthField({ label, icon, children, isValid, value }: { label: string; icon: React.ReactNode; children: React.ReactNode; isValid?: boolean; value?: string }) {
  const isFilled = Boolean(value && value.length > 0);
  return (
    <label className="block relative">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-zinc-400 ml-0.5">{label}</span>
      <div className="relative group">
        <span className={cn(
          "pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 transition-colors duration-200",
          isFilled ? (isValid ? "text-emerald-400" : "text-white") : "text-zinc-500"
        )}>
          {icon}
        </span>
        {children}
      </div>
    </label>
  );
}