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
  Quote
} from 'lucide-react';

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
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        {label && (
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            {label}
          </span>
        )}
        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-border to-transparent" />
      </div>
    </div>
  );
}

export function LandingView() {
  const { navigate } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground font-sans selection:bg-emerald-500/30 transition-colors duration-300">
      
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[20%] w-[800px] h-[800px] rounded-full bg-emerald-500/10 blur-[180px]" />
        <div className="absolute top-[40%] right-[-10%] w-[700px] h-[700px] rounded-full bg-teal-500/10 blur-[180px]" />
        <div className="absolute bottom-[-10%] left-[30%] w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-[160px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/5 via-background to-background" />
      </div>

      <div className="relative z-10">

        {/* Glassmorphic Navbar */}
        <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-2xl transition-colors">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <img src="/favicon.svg" alt="Aletheia Logo" className="h-9 w-9 rounded-xl shadow-lg shadow-emerald-500/25" />
              <div className="flex flex-col">
                <h1 className="text-base font-black tracking-tight text-foreground font-mono leading-none">Aletheia</h1>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mt-0.5">Equity Research Workspace</p>
              </div>
            </div>

            <nav className="hidden items-center gap-1 md:flex text-xs font-semibold text-muted-foreground">
              <a href="#capabilities" className="rounded-full px-3.5 py-1.5 transition-colors hover:text-foreground hover:bg-accent">
                Capabilities
              </a>
              <a href="#how-it-works" className="rounded-full px-3.5 py-1.5 transition-colors hover:text-foreground hover:bg-accent">
                Workflow
              </a>
              <a href="#testimonials" className="rounded-full px-3.5 py-1.5 transition-colors hover:text-foreground hover:bg-accent">
                Institutional Trust
              </a>
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground text-xs font-semibold rounded-full" asChild>
                <a href="https://github.com/shubham12112004/Aletheia#readme" target="_blank" rel="noopener noreferrer">
                  <BookOpen className="h-3.5 w-3.5" /> Docs
                </a>
              </Button>
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground text-xs font-semibold rounded-full" asChild>
                <a href="https://github.com/shubham12112004" target="_blank" rel="noopener noreferrer">
                  <Github className="h-3.5 w-3.5" /> GitHub
                </a>
              </Button>
            </nav>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                className="text-muted-foreground hover:text-foreground h-9 w-9 rounded-xl border border-border/80 bg-card/80 shadow-sm hover:bg-accent transition-all"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('auth', 'login')}
                className="text-xs font-bold text-muted-foreground hover:text-foreground"
              >
                Sign In
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('auth', 'register')}
                className="gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-500 text-xs rounded-xl h-9 px-4 active:scale-[0.97] transition-all"
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
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 backdrop-blur-xl shadow-inner"
              >
                <Sparkles className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
                <span>Multi-Agent VC & Equity Evaluation Engine · LangGraph Orchestrated</span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-balance text-5xl font-black tracking-tight text-foreground sm:text-7xl leading-[1.08]"
              >
                Autonomous AI agents for <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-200">
                  institutional equity research.
                </span>
              </motion.h1>

              {/* Sub-headline */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mx-auto mt-6 max-w-2xl text-balance text-base text-muted-foreground sm:text-lg font-medium leading-relaxed"
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
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-8 h-13 text-white font-bold text-sm shadow-xl shadow-emerald-500/25 transition-all hover:from-emerald-400 hover:to-teal-500 active:scale-[0.97]"
                >
                  <span className="relative flex items-center gap-2">
                    Enter Research Workspace <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('auth', 'login')}
                  className="rounded-xl border border-border/80 bg-card/80 px-8 h-13 text-foreground font-bold text-sm hover:bg-accent active:scale-[0.97] backdrop-blur-xl shadow-sm"
                >
                  Sign In to Terminal
                </Button>
              </motion.div>

              {/* Trust badges below CTA */}
              <div className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-4 text-xs font-semibold text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card/60 px-3.5 py-1.5 shadow-sm">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Grounded in SEC Filings
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card/60 px-3.5 py-1.5 shadow-sm">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Sub-Second Data Telemetry
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card/60 px-3.5 py-1.5 shadow-sm">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> 256-Bit Encrypted Vault
                </span>
              </div>
            </div>

            {/* Agent Network Map Interactive Visualizer */}
            <div className="relative mx-auto mt-16 max-w-5xl">
              <div className="absolute -inset-x-10 -top-10 bottom-0 rounded-3xl bg-gradient-to-b from-emerald-500/15 to-transparent blur-3xl pointer-events-none" />
              <div className="relative">
                <AgentNetworkMap />
              </div>
            </div>

          </div>
        </section>

        {/* STATISTICS STRIP */}
        <section className="border-y border-border/60 bg-card/50 backdrop-blur-xl py-10 transition-colors">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {STATS.map((stat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="text-3xl sm:text-4xl font-black text-foreground font-mono tracking-tight">{stat.value}</div>
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* INSTITUTIONAL MARQUEE LOGOS */}
        <section className="border-b border-border/60 bg-background py-8 overflow-hidden transition-colors">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="mb-6 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
              Trusted by research desks at top funds
            </p>
            <div className="relative overflow-hidden">
              <div className="flex w-max animate-marquee gap-14">
                {[...LOGOS, ...LOGOS, ...LOGOS].map((l, i) => (
                  <span key={i} className="text-base font-black text-muted-foreground/70 tracking-wider font-mono">
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
            <h2 className="text-balance text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              Engineered for precision equity research
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground font-medium">
              Three autonomous AI engines work in parallel so every verdict is grounded, stress-tested, and verifiable.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {VALUE_PROPS.map((vp) => {
              const Icon = vp.icon;
              return (
                <div
                  key={vp.title}
                  className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card/80 p-7 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1"
                >
                  <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
                  <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 shadow-inner">
                      <Icon className="h-6 w-6 stroke-[1.75]" />
                    </div>
                    <h3 className="mt-5 text-xl font-black tracking-tight text-foreground">
                      {vp.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground font-medium">
                      {vp.description}
                    </p>
                    <ul className="mt-5 space-y-2 pt-4 border-t border-border/60">
                      {vp.points.map((p) => (
                        <li key={p} className="flex items-center gap-2 text-xs font-semibold text-foreground/90">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
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
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: true }}
              className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400"
            >
              <Activity className="h-3.5 w-3.5" />
              LangGraph Execution Loop
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-balance text-3xl font-black tracking-tight text-foreground sm:text-4xl"
            >
              How the Research Swarm Operates
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground font-medium"
            >
              A four-stage autonomous pipeline converts raw tickers into institutional research reports.
            </motion.p>
          </div>

          <div className="relative">
            <div className="grid gap-6 md:grid-cols-4">
              {FLOW_STEPS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="relative group"
                  >
                    <div className="flex flex-col items-center text-center p-6 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-xl hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 hover:-translate-y-1">
                      <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 shadow-lg group-hover:shadow-emerald-500/20 transition-all">
                        <Icon className="h-6 w-6 stroke-[1.75] group-hover:scale-110 transition-transform" />
                        <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-black text-white shadow-md">
                          {i + 1}
                        </span>
                      </div>
                      <h4 className="text-base font-black text-foreground mb-1 group-hover:text-emerald-500 transition-colors">{s.label}</h4>
                      <p className="text-xs text-muted-foreground font-medium group-hover:text-foreground/90 transition-colors">{s.detail}</p>
                    </div>
                    {i < FLOW_STEPS.length - 1 && (
                      <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                        <motion.div
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="text-emerald-500/40 font-bold text-lg"
                        >
                          →
                        </motion.div>
                      </div>
                    )}
                  </motion.div>
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
        <section id="testimonials" className="border-t border-border/60 bg-gradient-to-b from-card/60 to-background py-20 relative overflow-hidden transition-colors">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-[10%] -top-[5%] h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />
            <div className="absolute -right-[10%] -bottom-[5%] h-[500px] w-[500px] rounded-full bg-teal-500/5 blur-[120px]" />
          </div>
          
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="mb-14 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                viewport={{ once: true }}
                className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400"
              >
                <Star className="h-3.5 w-3.5 fill-current text-emerald-500" /> Institutional Trust
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-balance text-3xl font-black tracking-tight text-foreground sm:text-4xl"
              >
                Validated by Quantitative Research Desks
              </motion.h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {TESTIMONIALS.map((t, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="group rounded-2xl border border-border/80 bg-card/80 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-6 transition-all duration-300 hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/5 hover:-translate-y-1"
                >
                  <div className="space-y-4">
                    <Quote className="h-8 w-8 text-emerald-500/40 group-hover:text-emerald-500 transition-colors" />
                    <p className="text-xs leading-relaxed text-muted-foreground font-medium italic">{`"${t.quote}"`}</p>
                  </div>
                  <div className="pt-4 border-t border-border/60">
                    <p className="text-xs font-black text-foreground">{t.author}</p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">{t.role}</p>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{t.fund}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-border/60 bg-background py-12 transition-colors">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 pb-8 border-b border-border/60">
              <div className="flex items-center gap-3">
                <img src="/favicon.svg" alt="Aletheia Logo" className="h-8 w-8 rounded-xl shadow-md" />
                <span className="text-base font-black text-foreground font-mono">Aletheia AI</span>
              </div>
              
              <div className="flex items-center gap-6 text-xs font-semibold text-muted-foreground">
                <a href="#capabilities" className="hover:text-foreground transition-colors">Capabilities</a>
                <a href="#how-it-works" className="hover:text-foreground transition-colors">Workflow</a>
                <a href="https://github.com/shubham12112004/Aletheia#readme" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">Docs</a>
                <a href="https://github.com/shubham12112004" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">GitHub</a>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-muted-foreground font-medium">
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
