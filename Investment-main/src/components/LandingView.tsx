import { AgentNetworkMap } from '@/components/AgentNetworkMap';
import { ComparisonMatrix } from '@/components/ComparisonMatrix';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
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
} from 'lucide-react';

// Note: Global window interface for turnstile left intact for when it's re-enabled later
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
      'Powered by LangGraph for resilient self-reflection. Specialist agents score fundamentals, moat, and sentiment in parallel â€” then a critic agent verifies every claim against primary sources.',
    points: ['Parallel specialist agents', 'Self-reflection guardrails', 'Verifiable citations'],
  },
  {
    icon: Radar,
    title: 'Live Data Aggregation',
    description:
      'Real-time market scanning and news sentiment mapping. We ingest filings, transcripts, pricing, and 14k+ news sources via Tavily so every verdict is grounded in current evidence.',
    points: ['SEC filings + transcripts', 'Intraday market data', 'FinBERT sentiment scoring'],
  },
  {
    icon: Gauge,
    title: 'Stress-Test Simulation',
    description:
      'Evaluate any asset against changing macro conditions. Slide from Deep Recession to Bull Market and watch the agent re-score confidence and verdict in real time.',
    points: ['4 macro regimes', 'Live confidence re-pricing', 'Downside scenario modeling'],
  },
];

const FLOW_STEPS = [
  { icon: FileInput, label: 'Input', detail: 'Company + macro regime' },
  { icon: Search, label: 'Scrape', detail: 'Filings, news, pricing' },
  { icon: ShieldCheck, label: 'Critique', detail: 'Critic + hallucination guard' },
  { icon: FileOutput, label: 'Output', detail: 'INVEST / PASS verdict' },
];

const LOGOS = ['BlackRock', 'Sequoia', 'Coatue', 'Bridgewater', 'Citadel', 'Two Sigma'];

function SectionDivider({ label }: { label?: string }) {
  return (
    <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-border" />
        {label && (
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {label}
          </span>
        )}
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-border" />
      </div>
    </div>
  );
}

export function LandingView() {
  const { navigate } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-40" />
      <div className="pointer-events-none fixed inset-0 bg-radial-fade" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="relative">
        {/* Nav */}
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-[10px]">
              <div className="relative flex h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 shrink-0 items-center justify-center">
                <img src="/android-chrome-512x512.png" alt="Aletheia" className="h-full w-full object-contain" style={{ aspectRatio: '1 / 1' }} />
              </div>
              <div className="flex flex-col justify-center">
                <h1 className="text-sm font-semibold tracking-tight text-foreground leading-tight">Aletheia</h1>
                <p className="text-[11px] text-muted-foreground leading-tight">Research Workspace for Equity Analysis</p>
              </div>
            </div>

            <nav className="hidden items-center gap-1 md:flex">
              <a href="#how-it-works" className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
                How it works
              </a>
              <a href="#different" className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
                Why us
              </a>
              <a href="#capabilities" className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
                Capabilities
              </a>
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                Docs
              </Button>
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                <Github className="h-4 w-4" />
                GitHub
              </Button>
            </nav>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-muted-foreground hover:text-foreground h-8 w-8"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('auth', 'login')}
                className="text-muted-foreground hover:text-foreground"
              >
                Sign in
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('auth', 'register')}
                className="gap-1.5 bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110"
              >
                Get started
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 bg-grid-fine opacity-30" />
          <div className="absolute inset-0 bg-hero-mesh animate-mesh-drift" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background/40 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
          <div className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-float-y" />
          <div className="pointer-events-none absolute -right-16 top-40 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl animate-float-y" style={{ animationDelay: '2s' }} />

          <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/70 glass px-3 py-1 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Multi-agent VC evaluation engine Â· powered by LangGraph
              </div>
              <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                <span>Aletheia</span>{' '}
                <span className="bg-gradient-to-r from-primary via-teal-400 to-emerald-400 bg-clip-text text-transparent">
                  Research Workspace for Equity Analysis
                </span>
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-balance text-base text-muted-foreground sm:text-lg">
                A multi-agent VC evaluation engine that ingests filings, market data, and
                sentiment â€” then critiques its own reasoning before returning a clear
                INVEST or PASS call. Stress-test any thesis across macro regimes and
                interrogate the agent on its verdict.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  onClick={() => navigate('auth', 'register')}
                  size="lg"
                  className="group relative h-12 gap-2 overflow-hidden rounded-xl bg-primary px-7 text-base font-semibold text-primary-foreground shadow-xl shadow-primary/30 transition-all hover:brightness-110"
                >
                  <span className="pointer-events-none absolute inset-0 rounded-xl bg-primary opacity-60 blur-md transition-opacity group-hover:opacity-90" />
                  <Sparkles className="relative h-4 w-4" />
                  <span className="relative">Launch Workspace</span>
                  <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
                <a
                  href="#how-it-works"
                  className="inline-flex h-12 items-center gap-1.5 rounded-xl border border-border/70 glass px-6 text-sm font-medium text-foreground transition-colors hover:bg-card/70"
                >
                  See how it works
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>

              <div className="mx-auto mt-6 flex max-w-2xl flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/40 px-3 py-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  Email password reset
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/40 px-3 py-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  Google sign-in ready
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/40 px-3 py-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  Secure workspace access
                </span>
              </div>
            </div>

            <div className="relative mx-auto mt-16 max-w-4xl">
              <div className="absolute -inset-x-10 -top-10 bottom-0 rounded-3xl bg-gradient-to-b from-primary/15 to-transparent blur-2xl" />
              <div className="relative animate-float-y" style={{ animationDuration: '8s' }}>
                <div className="absolute -left-3 top-8 hidden rounded-lg border border-primary/30 glass px-2.5 py-1.5 text-[10px] text-primary shadow-lg sm:block">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
                    critic pass Â· 4/4
                  </span>
                </div>
                <div className="absolute -right-3 bottom-12 hidden rounded-lg border border-border/70 glass px-2.5 py-1.5 text-[10px] text-muted-foreground shadow-lg sm:block">
                  <span className="flex items-center gap-1.5">
                    <Activity className="h-3 w-3 text-primary" />
                    12 citations verified
                  </span>
                </div>
                <AgentNetworkMap />
              </div>
            </div>
          </div>
        </section>

        {/* Logo marquee */}
        <section className="border-b border-border/60 bg-background/40 py-6">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p className="mb-4 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Trusted by research desks at
            </p>
            <div className="relative overflow-hidden mask-fade-b">
              <div className="flex w-max animate-marquee gap-10">
                {[...LOGOS, ...LOGOS].map((l, i) => (
                  <span key={i} className="text-lg font-semibold text-muted-foreground/60">
                    {l}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Value props */}
        <section id="capabilities" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Built for serious research, not headlines
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
              Three engines work together so every verdict is grounded, stress-tested, and explainable.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {VALUE_PROPS.map((vp) => {
              const Icon = vp.icon;
              return (
                <div
                  key={vp.title}
                  className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-6 shadow-xl transition-all hover:border-primary/40 hover:shadow-primary/10"
                >
                  <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
                  <div className="relative">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
                      {vp.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {vp.description}
                    </p>
                    <ul className="mt-4 space-y-1.5">
                      {vp.points.map((p) => (
                        <li key={p} className="flex items-center gap-2 text-xs text-foreground/80">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
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

        {/* How it works */}
        <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-10 text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1 text-xs text-muted-foreground">
              <Activity className="h-3.5 w-3.5 text-primary" />
              The pipeline
            </div>
            <h2 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              How it works
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
              A four-stage LangGraph pipeline turns a ticker into a defensible verdict.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block" />
            <div className="grid gap-4 md:grid-cols-4">
              {FLOW_STEPS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="relative">
                    <div className="flex flex-col items-center text-center">
                      <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/30 bg-card shadow-lg">
                        <Icon className="h-6 w-6 text-primary" />
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                          {i + 1}
                        </span>
                      </div>
                      <h4 className="mt-3 text-sm font-semibold text-foreground">{s.label}</h4>
                      <p className="mt-0.5 text-xs text-muted-foreground">{s.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-12 flex justify-center">
            <Button
              onClick={() => navigate('auth')}
              size="lg"
              className="group h-12 gap-2 rounded-xl bg-primary px-7 text-base font-semibold text-primary-foreground shadow-xl shadow-primary/30 transition-all hover:brightness-110"
            >
              Launch Workspace
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/60 py-8">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-xs text-muted-foreground sm:flex-row sm:px-6">
            <div className="flex items-center gap-2">
              <img src="/favicon.png" alt="Aletheia" className="h-4 w-4" style={{ aspectRatio: '1 / 1' }} />
              <span>Aletheia â€” Research Workspace for Equity Analysis</span>
            </div>
            <p>For research and educational use only. Not investment advice.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}