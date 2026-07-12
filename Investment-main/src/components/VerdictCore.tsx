import { useEffect, useState, type ReactNode } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  Scale,
  HeartPulse,
  Minus,
  Landmark,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { MacroScenario, Metric, ResearchResult, TimelineEntry } from '@/lib/types';
import { AnimatedCounter } from '@/components/AnimatedCounter';

const TONE_STYLES = {
  positive: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  negative: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  neutral: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
} as const;

const METRIC_ICONS: Record<string, typeof TrendingUp> = {
  Revenue: TrendingUp,
  'Debt Profile': Scale,
  'Moat Score': HeartPulse,
  'Risk Factor': ShieldCheck,
};

function ConfidenceGauge({ value, invest }: { value: number; invest: boolean }) {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  const offset = circumference - (progress / 100) * circumference;
  const color = invest ? '#10b981' : '#ef4444';

  return (
    <div className="relative flex h-[140px] w-[140px] items-center justify-center">
      {/* Soft background ping */}
      <span
        className="absolute h-24 w-24 rounded-full opacity-10 animate-ping"
        style={{ backgroundColor: color }}
      />
      <svg className="h-full w-full -rotate-90" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(63, 63, 70, 0.3)" strokeWidth="6" />
        <motion.circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: `drop-shadow(0 0 6px ${color}55)` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-black tracking-tight" style={{ color }}>
          <AnimatedCounter value={value} suffix="%" />
        </span>
        <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">
          Confidence
        </span>
      </div>
    </div>
  );
}

function MetricCard({ metric, index }: { metric: Metric; index: number }) {
  const tone = TONE_STYLES[metric.tone];
  const Icon = METRIC_ICONS[metric.label] ?? ShieldCheck;
  const TrendIcon =
    metric.tone === 'positive' ? TrendingUp : metric.tone === 'negative' ? TrendingDown : Minus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative overflow-hidden rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-3.5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-zinc-700/50 hover:bg-zinc-900/45 hover:translate-y-[-1px] hover:shadow-md"
    >
      <div className={cn('pointer-events-none absolute -right-5 -top-5 h-16 w-16 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-20', tone.bg)} />
      <div className="flex items-center justify-between">
        <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg border', tone.bg, tone.border)}>
          <Icon className={cn('h-4 w-4', tone.text)} />
        </div>
        <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase', tone.bg, tone.text)}>
          <TrendIcon className="h-2.5 w-2.5" />
          {metric.delta}
        </span>
      </div>
      <p className="mt-2.5 text-[9px] font-bold uppercase tracking-wider text-zinc-500">
        {metric.label}
      </p>
      <p className="mt-0.5 text-lg font-bold tracking-tight text-zinc-100">{metric.value}</p>
      <p className="mt-1 text-[10px] leading-relaxed text-zinc-400">
        {metric.description}
      </p>
    </motion.div>
  );
}

const WEIGHT_STYLES = {
  high: 'bg-red-500/10 text-red-400 border-red-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  low: 'bg-zinc-800/40 text-zinc-400 border-zinc-700/30',
} as const;

function ProsConsList({ items, positive }: { items: ResearchResult['pros']; positive: boolean }) {
  const Icon = positive ? TrendingUp : TrendingDown;
  return (
    <div className="space-y-2">
      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-800 p-4 text-center text-xs text-zinc-500">
          No analysis factors recorded.
        </p>
      ) : (
        items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: positive ? -8 : 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="flex items-start gap-3 rounded-xl border border-zinc-800/60 bg-zinc-950/20 p-3 hover:border-zinc-700/60 transition-colors"
          >
            <Icon className={cn('mt-0.5 h-3.5 w-3.5 shrink-0', positive ? 'text-emerald-400' : 'text-red-400')} />
            <p className="flex-1 text-xs leading-relaxed text-zinc-300 font-sans">{item.text}</p>
            <span className={cn('shrink-0 rounded-full border px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider', WEIGHT_STYLES[item.weight])}>
              {item.weight}
            </span>
          </motion.div>
        ))
      )}
    </div>
  );
}

type Props = {
  result: ResearchResult;
  scenario: MacroScenario;
  focus: { regulatory: boolean; insider: boolean };
  timeline: TimelineEntry[];
};

export function VerdictCore({ result, scenario, focus, timeline }: Props) {
  const invest = result.verdict === 'INVEST';
  const scoreCards = result.metrics.map((metric) => {
    const numeric = Number.parseFloat(metric.value.match(/(-?\d+(?:\.\d+)?)/)?.[1] ?? '0');
    return { name: metric.label, value: Number.isFinite(numeric) ? Math.min(100, Math.max(0, Math.round(Math.abs(numeric) * (metric.label === 'Debt Profile' ? 18 : 5)))) : 0 };
  });

  const reportSections = [
    {
      id: 'overview',
      title: 'Overview',
      copy: result.executiveSummary[0],
    },
    {
      id: 'financials',
      title: 'Financials',
      copy: result.metrics.map((metric) => `${metric.label}: ${metric.value}`).join(' · '),
    },
    {
      id: 'news',
      title: 'News',
      copy: `Primary-source news and filings verified across ${result.citations.length} sources.`,
    },
    {
      id: 'swot',
      title: 'SWOT',
      copy: `${result.pros.length} bullish factors and ${result.cons.length} risk items were identified.`,
    },
    {
      id: 'competitors',
      title: 'Competitors',
      copy: `The ${scenario.label} setting implies a tighter competitive backdrop and a higher bar for execution.`,
    },
    {
      id: 'valuation',
      title: 'Valuation',
      copy: invest ? 'Premium multiple is justified only if execution remains consistent.' : 'Valuation is not yet attractive relative to the risk profile.',
    },
    {
      id: 'risk',
      title: 'Risk',
      copy: focus.regulatory || focus.insider ? 'Focus filters elevated the risk surface and tightened confidence.' : 'Baseline risk remains within tolerance for the current regime.',
    },
    {
      id: 'recommendation',
      title: 'Recommendation',
      copy: `${result.verdict} at ${result.confidence}% confidence.`,
    },
  ];

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Verdict banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'relative overflow-hidden rounded-2xl border p-4 shadow-2xl backdrop-blur-xl',
          invest
            ? 'border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-zinc-950/70 to-zinc-950/70'
            : 'border-red-500/40 bg-gradient-to-br from-red-500/10 via-zinc-950/70 to-zinc-950/70'
        )}
      >
        <div className={cn('pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20 blur-3xl', invest ? 'bg-emerald-500' : 'bg-red-500')} />
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border',
                invest
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                  : 'border-red-500/40 bg-red-500/10 text-red-400'
              )}
            >
              {invest ? <ShieldCheck className="h-8 w-8 text-emerald-400 animate-pulse" /> : <ShieldAlert className="h-8 w-8 text-red-400 animate-pulse" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn('text-2xl font-black tracking-tight uppercase', invest ? 'text-emerald-400' : 'text-red-400')}>
                  {result.verdict}
                </span>
                <span className="rounded bg-zinc-800/80 px-2 py-0.5 font-mono text-[9px] font-bold text-zinc-400 border border-zinc-700/50">
                  {result.ticker}
                </span>
              </div>
              <h3 className="mt-1 truncate text-lg font-bold tracking-tight text-zinc-100 leading-tight">
                {result.company}
              </h3>
              <p className="text-[10px] text-zinc-500 font-semibold tracking-wide uppercase mt-0.5">
                Regime: {scenario.label}
              </p>
            </div>
          </div>
          <ConfidenceGauge value={result.confidence} invest={invest} />
        </div>
      </motion.div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {result.metrics.map((m, i) => (
          <MetricCard key={m.label} metric={m} index={i} />
        ))}
      </div>

      {/* Tabs */}
      <div className="flex-1 rounded-2xl border border-zinc-800/50 bg-zinc-900/35 p-4.5 shadow-2xl backdrop-blur-xl">
        <Tabs defaultValue="summary" className="flex h-full flex-col">
          <TabsList className="grid w-full grid-cols-4 bg-zinc-950/60 border border-zinc-800/60 p-1 rounded-xl">
            <TabsTrigger value="summary" className="text-[11px] font-bold uppercase tracking-wider py-1.5 rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-primary-foreground">Report</TabsTrigger>
            <TabsTrigger value="analytics" className="text-[11px] font-bold uppercase tracking-wider py-1.5 rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-primary-foreground">Analytics</TabsTrigger>
            <TabsTrigger value="proscons" className="text-[11px] font-bold uppercase tracking-wider py-1.5 rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-primary-foreground">Pros &amp; Cons</TabsTrigger>
            <TabsTrigger value="sources" className="text-[11px] font-bold uppercase tracking-wider py-1.5 rounded-lg data-[state=active]:bg-zinc-800 data-[state=active]:text-primary-foreground">Sources</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="mt-3.5 flex-1 outline-none">
            <ScrollArea className="h-[250px] pr-3 scrollbar-thin">
              <div className="space-y-4">
                {/* Timeline subset */}
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {timeline.slice(-4).map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: index * 0.04 }}
                      className="rounded-xl border border-zinc-800/50 bg-zinc-950/30 p-3 hover:border-zinc-700/40 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-zinc-900 pb-1.5 mb-1.5">
                        <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-wide flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                          {entry.label}
                        </p>
                        <span className="font-mono text-[9px] text-zinc-500">{entry.timestamp}</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-zinc-400 font-sans">{entry.detail}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Report Sections */}
                <div className="grid gap-3">
                  {reportSections.map((section, index) => (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="rounded-xl border border-zinc-800/50 bg-zinc-950/30 p-3.5 hover:border-zinc-750/50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-zinc-900 pb-1.5 mb-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">
                          {section.title}
                        </p>
                        <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[9px] font-mono text-zinc-500">
                          {index + 1} of 8
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-zinc-300 font-sans">{section.copy}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Deep Dive Note widgets */}
                {(focus.regulatory || focus.insider) && (
                  <div className="mt-4 space-y-2.5 border-t border-zinc-800/50 pt-3">
                    {focus.regulatory && (
                      <div className="rounded-xl border border-zinc-800 bg-zinc-950/20 p-3">
                        <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-zinc-200">
                          <Landmark className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                          Regulatory Deep-Dive Notes
                        </div>
                        <ul className="space-y-1.5">
                          {result.regulatoryNotes.map((n, i) => (
                            <li key={i} className="text-[11px] leading-relaxed text-zinc-400">• {n}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {focus.insider && (
                      <div className="rounded-xl border border-zinc-800 bg-zinc-950/20 p-3">
                        <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-zinc-200">
                          <UserCheck className="h-3.5 w-3.5 text-sky-400 animate-pulse" />
                          Insider Trading Tracking Notes
                        </div>
                        <ul className="space-y-1.5">
                          {result.insiderNotes.map((n, i) => (
                            <li key={i} className="text-[11px] leading-relaxed text-zinc-400">• {n}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="analytics" className="mt-3.5 flex-1 outline-none">
            <ScrollArea className="h-[250px] pr-3 scrollbar-thin">
              <div className="grid gap-4 lg:grid-cols-2">
                {/* Revenue & Profit Area Chart with gradient glow */}
                <ChartCard title="Revenue & Profit Trend">
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={result.revenueSeries}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(63, 63, 70, 0.15)" />
                      <XAxis dataKey="quarter" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(9, 9, 11, 0.9)', borderColor: 'rgba(63, 63, 70, 0.4)', borderRadius: '12px' }} />
                      <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                      <Area type="monotone" dataKey="profit" stroke="#14b8a6" strokeWidth={1.5} fillOpacity={1} fill="url(#colorProfit)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>

                {/* Score Breakdown Bar Chart */}
                <ChartCard title="Investment Score Breakdown">
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={scoreCards}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(63, 63, 70, 0.15)" />
                      <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(9, 9, 11, 0.9)', borderColor: 'rgba(63, 63, 70, 0.4)', borderRadius: '12px' }} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="hsl(var(--primary))">
                        {scoreCards.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? 'hsl(var(--primary))' : '#14b8a6'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                {/* Risk Radar Chart */}
                <ChartCard title="Risk Radar Analysis">
                  <ResponsiveContainer width="100%" height={180}>
                    <RadarChart data={scoreCards}>
                      <PolarGrid stroke="rgba(63, 63, 70, 0.2)" />
                      <PolarAngleAxis dataKey="name" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar dataKey="value" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.24} />
                    </RadarChart>
                  </ResponsiveContainer>
                </ChartCard>

                {/* Sentiment Pie chart */}
                <ChartCard title="Sentiment Balance Mix">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Bullish factors', value: result.pros.length || 3 },
                          { name: 'Risk items', value: result.cons.length || 2 },
                        ]}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={44}
                        outerRadius={65}
                        paddingAngle={5}
                      >
                        <Cell fill="hsl(var(--primary))" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(9, 9, 11, 0.9)', borderColor: 'rgba(63, 63, 70, 0.4)', borderRadius: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="proscons" className="mt-3.5 flex-1 outline-none">
            <ScrollArea className="h-[250px] pr-3 scrollbar-thin">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="mb-2.5 text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                    Bull Case Analysis ({result.pros.length})
                  </h4>
                  <ProsConsList items={result.pros} positive />
                </div>
                <div>
                  <h4 className="mb-2.5 text-xs font-bold text-red-400 flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5 text-red-400 animate-pulse" />
                    Bear Case Analysis ({result.cons.length})
                  </h4>
                  <ProsConsList items={result.cons} positive={false} />
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="sources" className="mt-3.5 flex-1 outline-none">
            <ScrollArea className="h-[250px] pr-3 scrollbar-thin">
              <div className="grid gap-3 sm:grid-cols-2">
                {result.citations.map((c, i) => (
                  <motion.a
                    key={i}
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                    className="group rounded-xl border border-zinc-800 bg-zinc-950/40 p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-zinc-900/25 shadow-sm"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2 border-b border-zinc-900 pb-1.5">
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400 uppercase tracking-wide">
                        Verified Citation
                      </span>
                      <span className="text-[9px] text-zinc-500 font-mono">{c.timestamp}</span>
                    </div>
                    <h5 className="truncate text-xs font-bold text-zinc-200 group-hover:text-primary transition-colors">
                      {c.title}
                    </h5>
                    <p className="mt-0.5 text-[10px] font-bold text-zinc-400">{c.source}</p>
                    <p className="mt-1.5 text-[10px] leading-relaxed text-zinc-500 font-sans line-clamp-3">{c.snippet}</p>
                  </motion.a>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-3.5">
      <div className="mb-3.5 flex items-center justify-between border-b border-zinc-900 pb-1.5">
        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-500">
          {title}
        </p>
      </div>
      {children}
    </div>
  );
}
