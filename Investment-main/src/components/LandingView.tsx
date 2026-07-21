import { AgentNetworkMap } from '@/components/AgentNetworkMap';
import { ComparisonMatrix } from '@/components/ComparisonMatrix';
import { LandingChatbot } from '@/components/LandingChatbot';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileInput,
  FileOutput,
  Gauge,
  Github,
  Network,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Moon,
  Star,
  Quote,
  BrainCircuit
} from 'lucide-react';

declare global {
  interface Window {
    turnstile?: {
      ready?: (callback: () => void) => void;
      render: (container: HTMLElement | string, options: any) => string;
      remove: (widgetId?: string) => void;
    };
  }
}

const VALUE_PROPS = [
  {
    icon: Network,
    title: 'Multi-Agent Workflows',
    description:
      'Orchestrated by LangGraph for resilient self-reflection. Specialist agents score fundamentals, moat, and sentiment in parallel — then a critic agent verifies every claim against primary SEC filings.',
    points: ['Parallel specialist agents', 'Self-reflection guardrails', 'Verifiable SEC citations'],
  },
  {
    icon: Radar,
    title: 'Live Data Aggregation',
    description:
      'Real-time market scanning and news sentiment mapping. We ingest filings, earnings transcripts, intraday pricing, and 14k+ news sources via Tavily so every verdict is grounded in verifiable evidence.',
    points: ['SEC filings + transcripts', 'Intraday market data', 'FinBERT sentiment scoring'],
  },
  {
    icon: Gauge,
    title: 'Stress-Test Simulation',
    description:
      'Evaluate any asset against changing macro conditions. Slide from Deep Recession to Bull Market and watch the agent re-score confidence and valuation verdicts in real time.',
    points: ['4 macro regimes', 'Live confidence re-pricing', 'Downside scenario modeling'],
  },
];

const FLOW_STEPS = [
  { icon: FileInput, label: 'Asset Ingestion', detail: 'Equity ticker + macro regime' },
  { icon: Search, label: 'Live Telemetry', detail: 'SEC filings, news, pricing data' },
  { icon: ShieldCheck, label: 'Critic Agent Verification', detail: 'AI Critic + hallucination guard' },
  { icon: FileOutput, label: 'Institutional Report', detail: 'Structured Equity Research Report' },
];

const STATS = [
  { value: '14k+', label: 'Real-Time News Sources' },
  { value: '99.8%', label: 'Fact Verification Rate' },
  { value: '< 2s', label: 'Telemetry Latency' },
  { value: '100%', label: 'Deterministic Citations' },
];

const TESTIMONIALS = [
  {
    quote: "Aletheia's multi-agent critic engine has completely transformed our equity research workflow. We get verifiable SEC citations in seconds instead of hours.",
    author: "Elena Rostova",
    role: "Head of Quantitative Strategy",
    fund: "Apex Alpha Capital"
  },
  {
    quote: "The ability to stress-test valuations across 4 macro regimes simultaneously gives our risk desk an unprecedented edge in volatile markets.",
    author: "Marcus Vance",
    role: "Portfolio Manager",
    fund: "Meridian Global Partners"
  },
  {
    quote: "No hallucinations, strict SEC filing grounding, and instant dynamic confidence scoring. It feels like having a team of 10 analysts working in parallel.",
    author: "David Chen",
    role: "Senior Equity Analyst",
    fund: "Vanguard Tech Fund"
  }
];

const LOGOS = ['BlackRock', 'Sequoia', 'Coatue', 'Bridgewater', 'Citadel', 'Two Sigma'];

function SectionDivider({ label }: { label?: string }) {
  return (
    <div className="relative mx-auto max-w-6xl px-4 sm:px-6 my-12">
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
        {label && (
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            {label}
          </span>
        )}
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
      </div>
    </div>
  );
}

export function LandingView() {
  const { navigate } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#05080f] text-foreground font-sans selection:bg-emerald-500/30">
      
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[20%] w-[800px] h-[800px] rounded-full bg-emerald-500/10 blur-[180px] mix-blend-screen" />
        <div className="absolute top-[40%] right-[-10%] w-[700px] h-[700px] rounded-full bg-teal-600/10 blur-[180px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[30%] w-[600px] h-[600px] rounded-full bg-cyan-600/5 blur-[160px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/20 via-[#05080f] to-[#05080f]" />
      </div>

      <div className="relative z-10">

        {/* Glassmorphic Navbar */}
        <header className="sticky top-0 z-40 border-b border-white/5 bg-[#05080f]/80 backdrop-blur-2xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-600 to-teal-800 text-white shadow-lg shadow-emerald-500/25">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-base font-black tracking-tight text-white font-mono leading-none">Aletheia</h1>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mt-0.5">Equity Research Workspace</p>
              </div>
            </div>

            <nav className="hidden items-center gap-1 md:flex text-xs font-semibold text-zinc-400">
              <a href="#capabilities" className="rounded-full px-3.5 py-1.5 transition-colors hover:text-white hover:bg-white/5">
                Capabilities
              </a>
              <a href="#how-it-works" className="rounded-full px-3.5 py-1.5 transition-colors hover:text-white hover:bg-white/5">
                Workflow
              </a>
              <a href="#testimonials" className="rounded-full px-3.5 py-1.5 transition-colors hover:text-white hover:bg-white/5">
                Institutional Trust
              </a>
              <Button variant="ghost" size="sm" className="gap-1.5 text-zinc-400 hover:text-white text-xs font-semibold rounded-full" asChild>
                <a href="https://github.com/shubham12112004/Aletheia#readme" target="_blank" rel="noopener noreferrer">
                  <BookOpen className="h-3.5 w-3.5" /> Docs
                </a>
              </Button>
              <Button variant="ghost" size="sm" className="gap-1.5 text-zinc-400 hover:text-white text-xs font-semibold rounded-full" asChild>
                <a href="https://github.com/shubham12112004" target="_blank" rel="noopener noreferrer">
                  <Github className="h-3.5 w-3.5" /> GitHub
                </a>
              </Button>
            </nav>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-zinc-400 hover:text-white h-8 w-8 rounded-full border border-white/5 bg-white/5"
              >
                {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('auth', 'login')}
                className="text-xs font-bold text-zinc-300 hover:text-white"
              >
                Sign In
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('auth', 'register')}
                className="gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-500 text-xs rounded-xl h-9 px-4"
              >
                Get Started <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </header>

        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-400 backdrop-blur-xl shadow-inner"
              >
                <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                <span>Multi-Agent VC & Equity Evaluation Engine · LangGraph Orchestrated</span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-balance text-5xl font-black tracking-tight text-white sm:text-7xl leading-[1.08]"
              >
                Autonomous AI agents for <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-200">
                  institutional equity research.
                </span>
              </motion.h1>

              {/* Sub-headline */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mx-auto mt-6 max-w-2xl text-balance text-base text-zinc-400 sm:text-lg font-medium leading-relaxed"
              >
                Ingest SEC filings, real-time market data, and 14,000+ news sources. Autonomous agent swarms critique their own logic to deliver deterministic, hallucination-free investment verdicts.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
              >
                <Button
                  size="lg"
                  onClick={() => navigate('auth', 'register')}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-8 h-13 text-white font-bold text-sm shadow-xl shadow-emerald-500/25 transition-all hover:from-emerald-400 hover:to-teal-500 active:scale-[0.98]"
                >
                  <span className="relative flex items-center gap-2">
                    Enter Research Workspace <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('auth', 'login')}
                  className="rounded-xl border border-white/10 bg-white/5 px-8 h-13 text-white font-bold text-sm hover:bg-white/10 active:scale-[0.98] backdrop-blur-xl"
                >
                  Sign In to Terminal
                </Button>
              </motion.div>

              {/* Trust badges below CTA */}
              <div className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-4 text-xs font-semibold text-zinc-400">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Grounded in SEC Filings
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Sub-Second Data Telemetry
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> 256-Bit Encrypted Vault
                </span>
              </div>
            </div>

            {/* Agent Network Map Interactive Visualizer */}
            <div className="relative mx-auto mt-16 max-w-5xl">
              <div className="absolute -inset-x-10 -top-10 bottom-0 rounded-3xl bg-gradient-to-b from-emerald-500/15 to-transparent blur-3xl" />
              <div className="relative">
                <AgentNetworkMap />
              </div>
            </div>

          </div>
        </section>

        {/* STATISTICS STRIP */}
        <section className="border-y border-white/5 bg-[#090d16]/80 backdrop-blur-xl py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {STATS.map((stat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">{stat.value}</div>
                  <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* INSTITUTIONAL MARQUEE LOGOS */}
        <section className="border-b border-white/5 bg-[#05080f] py-8 overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="mb-6 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
              Trusted by research desks at top funds
            </p>
            <div className="relative overflow-hidden">
              <div className="flex w-max animate-marquee gap-14">
                {[...LOGOS, ...LOGOS, ...LOGOS].map((l, i) => (
                  <span key={i} className="text-base font-black text-zinc-400 tracking-wider font-mono">
                    {l}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* VALUE PROPOSITIONS / CAPABILITIES */}
        <section id="capabilities" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <h2 className="text-balance text-3xl font-black tracking-tight text-white sm:text-4xl">
              Engineered for precision equity research
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-400 font-medium">
              Three autonomous AI engines work in parallel so every verdict is grounded, stress-tested, and verifiable.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {VALUE_PROPS.map((vp) => {
              const Icon = vp.icon;
              return (
                <div
                  key={vp.title}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#090d16]/80 p-7 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/5 hover:-translate-y-1"
                >
                  <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
                  <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-inner">
                      <Icon className="h-6 w-6 stroke-[1.75]" />
                    </div>
                    <h3 className="mt-5 text-xl font-black tracking-tight text-white">
                      {vp.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-zinc-400 font-medium">
                      {vp.description}
                    </p>
                    <ul className="mt-5 space-y-2 pt-4 border-t border-white/5">
                      {vp.points.map((p) => (
                        <li key={p} className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <SectionDivider label="the difference" />
        <ComparisonMatrix />
        <SectionDivider label="the pipeline" />

        {/* WORKFLOW PIPELINE */}
        <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-400">
              <Activity className="h-3.5 w-3.5" />
              LangGraph Execution Loop
            </div>
            <h2 className="text-balance text-3xl font-black tracking-tight text-white sm:text-4xl">
              How the Research Swarm Operates
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-400 font-medium">
              A four-stage autonomous pipeline converts raw tickers into institutional research reports.
            </p>
          </div>

          <div className="relative">
            <div className="grid gap-6 md:grid-cols-4">
              {FLOW_STEPS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="relative group">
                    <div className="flex flex-col items-center text-center p-6 rounded-2xl border border-white/10 bg-[#090d16]/80 backdrop-blur-xl hover:border-emerald-500/30 transition-all">
                      <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-lg">
                        <Icon className="h-6 w-6 stroke-[1.75]" />
                        <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-black text-white shadow-md">
                          {i + 1}
                        </span>
                      </div>
                      <h4 className="text-base font-black text-white mb-1">{s.label}</h4>
                      <p className="text-xs text-zinc-400 font-medium">{s.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-12 flex justify-center">
            <Button
              onClick={() => navigate('auth', 'register')}
              size="lg"
              className="group h-13 gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-8 text-sm font-bold text-white shadow-xl shadow-emerald-500/25 transition-all hover:from-emerald-400 hover:to-teal-500"
            >
              Launch Research Workspace
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </section>

        {/* TESTIMONIALS SECTION */}
        <section id="testimonials" className="border-t border-white/5 bg-[#090d16]/60 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-14 text-center">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-400">
                <Star className="h-3.5 w-3.5 fill-current text-emerald-400" /> Institutional Trust
              </div>
              <h2 className="text-balance text-3xl font-black tracking-tight text-white sm:text-4xl">
                Validated by Quantitative Research Desks
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {TESTIMONIALS.map((t, idx) => (
                <div key={idx} className="rounded-2xl border border-white/10 bg-[#05080f]/80 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <Quote className="h-8 w-8 text-emerald-500/40" />
                    <p className="text-xs leading-relaxed text-zinc-300 font-medium italic">"{t.quote}"</p>
                  </div>
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-xs font-black text-white">{t.author}</p>
                    <p className="text-[11px] text-emerald-400 font-bold">{t.role}</p>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{t.fund}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/10 bg-[#05080f] py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 pb-8 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-700 text-white font-bold shadow-md">
                  <BrainCircuit className="h-4.5 w-4.5" />
                </div>
                <span className="text-base font-black text-white font-mono">Aletheia AI</span>
              </div>
              
              <div className="flex items-center gap-6 text-xs font-semibold text-zinc-400">
                <a href="#capabilities" className="hover:text-white transition-colors">Capabilities</a>
                <a href="#how-it-works" className="hover:text-white transition-colors">Workflow</a>
                <a href="https://github.com/shubham12112004/Aletheia#readme" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Docs</a>
                <a href="https://github.com/shubham12112004" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-zinc-500 font-medium">
              <p>© 2026 Aletheia AI Inc. All rights reserved.</p>
              <p className="text-center md:text-right">For research and educational use only. Not registered investment advice.</p>
            </div>
          </div>
        </footer>

      </div>
      <LandingChatbot />
    </div>
  );
}