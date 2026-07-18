import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import {
  ArrowLeft, BrainCircuit, KeyRound, Loader2,
  Lock, Mail, ShieldCheck, TrendingUp, User, Zap, CheckCircle2,
  Eye, EyeOff, XCircle, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TurnstileWidget } from '@/components/TurnstileWidget';
import { useAuth } from '@/context/AuthContext';
import { postGoogleLogin, postSignup, postEmailLogin, postForgotPassword, postVerifyOTP } from '@/lib/api';
import { cn } from '@/lib/utils';

type Mode = 'login' | 'signup' | 'forgot';

const features = [
  { icon: TrendingUp, label: 'Live Market Intelligence', desc: 'Real-time financial data from global exchanges.' },
  { icon: Zap, label: 'Evidence-Backed Reports', desc: 'AI analysis strictly grounded in verifiable sources.' },
  { icon: ShieldCheck, label: 'Private Research Workspace', desc: 'Your research, portfolios, and data are encrypted.' },
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
  if (msg.includes('user not found') || msg.includes('invalid credentials')) return 'We couldn’t find an account matching these credentials. Please try again.';
  if (msg.includes('already exists')) return 'An account with this email already exists. Try signing in instead.';
  if (msg.includes('turnstile')) return 'Our automated security check failed. Please refresh the page and try again.';
  if (msg.includes('network')) return 'We’re having trouble connecting to the servers. Please check your internet connection.';
  return errMessage;
};

export function AuthView() {
  const { authMode, setAuthMode, setSession, navigate } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword] = useState(false);
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
  const [showNewPassword] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const turnstileSiteKey = import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITEKEY as string | undefined;
  const hasGoogleConfig = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const canSubmit = Boolean(turnstileSiteKey && turnstileToken && !submitting);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPasswordValid = password.length >= 6;
  const isConfirmValid = password === confirmPassword && confirmPassword.length > 0;
  const isNameValid = name.trim().length > 1;
  const pwStrength = getPasswordStrength(password);
  
  const ctaLabel = useMemo(() => {
    if (mode === 'login') return 'Sign into Workspace';
    if (mode === 'signup') return 'Create Workspace';
    return 'Send Reset Link';
  }, [mode]);

  useEffect(() => {
    setMode(authMode === 'register' ? 'signup' : authMode === 'reset' ? 'forgot' : 'login');
  }, [authMode]);

  useEffect(() => {
    if (!submitting) return;
    const texts = [
      'Authenticating your credentials...',
      'Securing your connection...',
      'Preparing your AI workspace...',
      'Loading market intelligence modules...',
    ];
    let i = 0;
    setLoadingText(texts[0]);
    const interval = setInterval(() => {
      i = (i + 1) % texts.length;
      setLoadingText(texts[i]);
    }, 2000);
    return () => clearInterval(interval);
  }, [submitting]);

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

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        r: Math.random() * 2 + 0.5,
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
        ctx.fillStyle = `rgba(52, 211, 153, ${p.a * 0.3})`;
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

    if (!isEmailValid) return setError('Please provide a valid email address.');
    if (mode !== 'forgot' && !isPasswordValid) return setError('Your password must contain at least 6 characters.');
    if (mode === 'signup' && !isConfirmValid) return setError('Your passwords do not match.');
    if (mode === 'signup' && !isNameValid) return setError('Please tell us your full name.');
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
      setError(getFriendlyError(err instanceof Error ? err.message : 'Secure access could not be established.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleCredential = async (credentialResponse: CredentialResponse) => {
    if (!hasGoogleConfig) return setError('Google sign-in is currently unavailable.');
    if (!turnstileToken) return setError('Security verification is required before using Google.');
    if (!credentialResponse.credential) return setError('Google authentication failed. Please try again.');
    
    setSubmitting(true);
    setLoadingText('Authenticating with Google...');
    try {
      const session = await postGoogleLogin(credentialResponse.credential, turnstileToken);
      setSession({ token: session.token, user: { email: session.user.email, name: session.user.name || session.user.email.split('@')[0], provider: 'google' } });
    } catch (err) {
      setTurnstileToken('');
      setTurnstileKey((v) => v + 1);
      setError(getFriendlyError(err instanceof Error ? err.message : 'Google sign-in could not be completed.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#09090b] text-foreground font-sans selection:bg-emerald-500/30">
      
      {/* Aurora background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-[10%] -top-[10%] h-[800px] w-[800px] rounded-full bg-emerald-500/10 blur-[150px] mix-blend-screen" />
        <div className="absolute -bottom-[20%] -right-[10%] h-[600px] w-[600px] rounded-full bg-teal-600/10 blur-[150px] mix-blend-screen" />
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:32px_32px]" />
      </div>

      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 h-full w-full opacity-40 mix-blend-screen" />

      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        type="button"
        onClick={() => navigate('landing')}
        className="absolute left-6 top-6 z-50 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-zinc-300 backdrop-blur-md transition-all hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-400 shadow-sm"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to platform
      </motion.button>

      <div className="relative z-10 mx-auto grid min-h-screen max-w-[1400px] px-4 lg:grid-cols-2 lg:gap-8 xl:gap-16 lg:px-8">

        {/* LEFT — Branding panel */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="hidden flex-col justify-center py-20 lg:flex relative"
        >
          {/* Logo */}
          <div className="flex items-center gap-4 mb-20">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 shadow-xl shadow-emerald-500/20">
              <BrainCircuit className="h-7 w-7 text-white" />
              <div className="absolute inset-0 rounded-2xl ring-1 ring-white/20" />
            </div>
            <div>
              <p className="text-xl font-black tracking-tight text-white">Aletheia</p>
              <p className="text-sm font-medium text-emerald-500/80 uppercase tracking-widest">Enterprise Edition</p>
            </div>
          </div>

          {/* Headline */}
          <div className="max-w-xl relative">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-5xl xl:text-6xl font-black leading-[1.1] tracking-tight text-white mb-6"
            >
              Institutional intelligence, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">democratized.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-lg leading-relaxed text-zinc-400 font-medium"
            >
              Access the same real-time market data, AI agent swarms, and deterministic research algorithms used by top quantitative hedge funds.
            </motion.p>
          </div>

          {/* Feature list */}
          <div className="mt-16 space-y-4 max-w-lg">
            {features.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-5 rounded-2xl border border-white/5 bg-white/[0.02] p-5 backdrop-blur-md transition-colors hover:bg-white/[0.04]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 shadow-inner">
                  <f.icon className="h-6 w-6 stroke-[1.5]" />
                </div>
                <div>
                  <p className="text-base font-bold text-zinc-100">{f.label}</p>
                  <p className="mt-1 text-sm text-zinc-500 font-medium leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT — Auth card */}
        <div className="flex items-center justify-center py-12 lg:py-20 relative">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="w-full max-w-[460px]"
          >
            {/* Card glass panel */}
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#09090b]/80 p-8 shadow-2xl shadow-black/50 backdrop-blur-2xl sm:p-10">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-50" />

              {/* Mobile logo */}
              <div className="mb-10 flex items-center justify-center gap-3 lg:hidden">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-lg shadow-emerald-500/30">
                  <BrainCircuit className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <p className="font-black text-white text-xl">Aletheia</p>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-500">Workspace</p>
                </div>
              </div>

              {/* Mode tabs */}
              <div className="mb-8 inline-flex w-full rounded-xl border border-white/10 bg-black/40 p-1.5 shadow-inner backdrop-blur-sm">
                {(['login', 'signup'] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => switchMode(item)}
                    className={cn(
                      'flex-1 rounded-lg py-2.5 text-sm font-bold transition-all duration-300',
                      mode === item 
                        ? 'bg-zinc-800/80 text-white shadow-md ring-1 ring-white/10' 
                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
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
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="mb-8"
                >
                  <h2 className="text-3xl font-black tracking-tight text-white mb-2">
                    {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Start building' : 'Recover access'}
                  </h2>
                  <p className="text-sm font-medium leading-relaxed text-zinc-400">
                    {mode === 'login'
                      ? 'Securely access your institutional research and active portfolios.'
                      : mode === 'signup'
                      ? 'Join the platform to unlock AI-driven financial intelligence.'
                      : 'Enter your email address to receive a secure recovery code.'}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Success message popup */}
              <AnimatePresence>
                {successMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-400 flex items-start gap-3 shadow-inner"
                  >
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    <span className="leading-snug">{successMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error message popup */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm font-bold text-rose-400 flex items-start gap-3 shadow-inner"
                  >
                    <XCircle className="h-5 w-5 shrink-0" />
                    <span className="leading-snug">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {mode === 'signup' && (
                  <AuthField label="Full Name" icon={<User className="h-4 w-4" />} isValid={isNameValid} value={name}>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jordan Analyst"
                      autoComplete="name"
                      className="h-12 w-full rounded-xl border border-white/10 bg-black/40 pl-11 pr-10 text-white placeholder:text-zinc-600 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20 transition-all font-medium"
                    />
                  </AuthField>
                )}
                
                <AuthField label="Email Address" icon={<Mail className="h-4 w-4" />} isValid={isEmailValid} value={email}>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@fund.com"
                    autoComplete="email"
                    className="h-12 w-full rounded-xl border border-white/10 bg-black/40 pl-11 pr-10 text-white placeholder:text-zinc-600 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20 transition-all font-medium"
                  />
                </AuthField>

                {mode !== 'forgot' && (
                  <div className="space-y-5">
                    <AuthField label="Password" icon={<Lock className="h-4 w-4" />} isValid={isPasswordValid} value={password}>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                          className="h-12 w-full rounded-xl border border-white/10 bg-black/40 pl-11 pr-12 text-white placeholder:text-zinc-600 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20 transition-all font-medium font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white focus:outline-none transition-colors p-1"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </AuthField>

                    {/* Password Strength Indicator (Signup Only) */}
                    {mode === 'signup' && password.length > 0 && (
                      <div className="space-y-1.5 mt-2">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-zinc-500">Password Strength</span>
                          <span className={cn(
                            pwStrength.score < 2 ? "text-rose-400" : pwStrength.score === 2 ? "text-amber-400" : "text-emerald-400"
                          )}>{pwStrength.label}</span>
                        </div>
                        <div className="flex gap-1 h-1.5">
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
                            className="h-12 w-full rounded-xl border border-white/10 bg-black/40 pl-11 pr-12 text-white placeholder:text-zinc-600 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20 transition-all font-medium font-mono"
                          />
                        </div>
                      </AuthField>
                    )}
                  </div>
                )}

                {mode === 'login' && (
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-xs font-medium text-zinc-500">Secure connection</div>
                    <button
                      type="button"
                      onClick={() => switchMode('forgot')}
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Forgot password – 2-step OTP UI */}
                {mode === 'forgot' && otpSent && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-5">
                    <AuthField label="6-Digit Verification Code" icon={<KeyRound className="h-4 w-4" />} isValid={otp.length === 6} value={otp}>
                      <Input
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="123456"
                        maxLength={6}
                        inputMode="numeric"
                        className="h-14 w-full rounded-xl border border-white/10 bg-black/40 pl-11 text-center text-2xl font-black tracking-[0.5em] text-white placeholder:text-zinc-700 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20 transition-all"
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
                          className="h-12 w-full rounded-xl border border-white/10 bg-black/40 pl-11 pr-12 text-white placeholder:text-zinc-600 focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20 transition-all font-medium font-mono"
                        />
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
                  <div className="flex justify-start mt-2">
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="text-xs font-bold text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
                    >
                      <ArrowLeft className="h-3 w-3" /> Return to sign in
                    </button>
                  </div>
                )}

                <div className="pt-2">
                  {!(mode === 'forgot' && otpSent) && (turnstileSiteKey ? (
                    <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20 p-1">
                      <TurnstileWidget key={turnstileKey} siteKey={turnstileSiteKey} onToken={setTurnstileToken} onError={setError} />
                    </div>
                  ) : (
                    <p className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs font-bold text-rose-400 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" /> Security misconfiguration. Please contact support.
                    </p>
                  ))}
                </div>

                <Button
                  type="submit"
                  disabled={!canSubmit || submitting}
                  className="group relative h-14 w-full overflow-hidden rounded-xl bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/40 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 mt-4 text-base"
                >
                  <div className="relative flex items-center justify-center gap-2 w-full h-full">
                    {submitting ? (
                      <AnimatePresence mode="wait">
                        <motion.div key={loadingText} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="flex items-center gap-3">
                          <Loader2 className="h-5 w-5 animate-spin text-white" />
                          <span>{loadingText}</span>
                        </motion.div>
                      </AnimatePresence>
                    ) : (
                      <>
                        {ctaLabel}
                        <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </div>
                </Button>
              </form>

              {/* Divider + Google */}
              {!(mode === 'forgot' && otpSent) && (
                <div className="mt-8 flex items-center gap-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Or Continue With</span>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
                </div>
              )}

              {/* Google */}
              {!(mode === 'forgot' && otpSent) && (
                <div className="mt-8 flex min-h-12 justify-center">
                  {canSubmit ? (
                    <div className="rounded-xl overflow-hidden shadow-md ring-1 ring-white/10 hover:ring-white/20 transition-all bg-black">
                      <GoogleLogin
                        onSuccess={handleGoogleCredential}
                        onError={() => setError('Google authentication cancelled.')}
                        theme="filled_black"
                        size="large"
                        text={mode === 'signup' ? 'signup_with' : 'signin_with'}
                        shape="rectangular"
                        width="380"
                      />
                    </div>
                  ) : (
                    <div className="flex h-12 w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-zinc-500">
                      Complete Cloudflare verification first
                    </div>
                  )}
                </div>
              )}

              {/* Footer tag */}
              <div className="mt-10 flex items-center justify-center gap-2 text-xs font-bold text-zinc-600">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Enterprise-grade security by Cloudflare
              </div>

            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

function AuthField({ label, icon, children, isValid, value }: { label: string; icon: React.ReactNode; children: React.ReactNode; isValid?: boolean; value?: string }) {
  const isFilled = value && value.length > 0;
  return (
    <label className="block relative">
      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-400 ml-1">{label}</span>
      <div className="relative group">
        <span className={cn(
          "pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 transition-colors duration-300",
          isFilled ? (isValid ? "text-emerald-500" : "text-white") : "text-zinc-500"
        )}>
          {icon}
        </span>
        {children}
      </div>
    </label>
  );
}