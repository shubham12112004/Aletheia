import { X, Check, AlertTriangle, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

type Row = {
  dimension: string;
  standard: { text: string; tone: 'bad' };
  aletheia: { text: string; tone: 'good' };
};

const ROWS: Row[] = [
  {
    dimension: 'Numerical accuracy',
    standard: { tone: 'bad', text: 'Hallucinates numbers — fabricated revenue and margin figures with no source.' },
    aletheia: { tone: 'good', text: 'Live data cross-checking — every figure tied to a primary filing or feed.' },
  },
  {
    dimension: 'Self-correction',
    standard: { tone: 'bad', text: 'No self-correction — first answer is final, even when wrong.' },
    aletheia: { tone: 'good', text: 'Autonomous critic guardrails — a critic agent re-checks every claim before output.' },
  },
  {
    dimension: 'Market guidance',
    standard: { tone: 'bad', text: 'Generic news advice — recycles headlines into vague buy/sell calls.' },
    aletheia: { tone: 'good', text: 'Deterministic macro-stress testing — re-prices across 4 macro regimes.' },
  },
  {
    dimension: 'Citations',
    standard: { tone: 'bad', text: 'Opaque — no way to verify where a claim came from.' },
    aletheia: { tone: 'good', text: 'Every claim links to a timestamped, primary source.' },
  },
  {
    dimension: 'Explainability',
    standard: { tone: 'bad', text: 'Black box — "buy because it looks good."' },
    aletheia: { tone: 'good', text: 'Node-by-node pipeline trace you can interrogate.' },
  },
];

export function ComparisonMatrix() {
  return (
    <section id="different" className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mb-10 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Why we&apos;re different
        </div>
        <h2 className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          A standard LLM prompt vs. the Aletheia system
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
          Most tools hand a ticker to an LLM and hope. Aletheia runs a multi-agent
          LangGraph pipeline that critiques itself before it speaks.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/60 shadow-xl">
        {/* header row */}
        <div className="grid grid-cols-[1.2fr_1fr_1fr] gap-px bg-border/40">
          <div className="bg-card/80 px-4 py-3">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Dimension
            </span>
          </div>
          <div className="bg-card/80 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10">
                <Zap className="h-3.5 w-3.5 text-red-400" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">Standard LLM prompt</p>
                <p className="text-[11px] text-muted-foreground">Single-shot, no guardrails</p>
              </div>
            </div>
          </div>
          <div className="bg-card/80 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">Aletheia system</p>
                <p className="text-[11px] text-primary">Multi-agent · LangGraph</p>
              </div>
            </div>
          </div>
        </div>

        {/* body rows */}
        <div className="grid grid-cols-1 gap-px bg-border/40">
          {ROWS.map((r, i) => (
            <div
              key={r.dimension}
              className={cn(
                'grid grid-cols-1 gap-px bg-border/40 sm:grid-cols-[1.2fr_1fr_1fr]',
                i % 2 === 1 && 'bg-background/20'
              )}
            >
              {/* dimension */}
              <div className="bg-card/60 px-4 py-3.5">
                <p className="text-sm font-semibold text-foreground">{r.dimension}</p>
              </div>

              {/* standard */}
              <div className="group flex items-start gap-2.5 bg-red-950/10 px-4 py-3.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-red-500/30 bg-red-500/10 text-red-400">
                  <X className="h-3 w-3" />
                </span>
                <p className="text-xs leading-relaxed text-muted-foreground">{r.standard.text}</p>
              </div>

              {/* aletheia */}
              <div className="group flex items-start gap-2.5 bg-primary/5 px-4 py-3.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/15 text-primary">
                  <Check className="h-3 w-3" />
                </span>
                <p className="text-xs leading-relaxed text-foreground/90">{r.aletheia.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* footer verdict */}
        <div className="grid grid-cols-1 gap-px bg-border/40 sm:grid-cols-[1.2fr_1fr_1fr]">
          <div className="bg-card/80 px-4 py-3">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Bottom line
            </span>
          </div>
          <div className="flex items-center gap-2 bg-red-950/10 px-4 py-3">
            <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
            <span className="text-xs font-medium text-red-400">Unreliable for capital allocation</span>
          </div>
          <div className="flex items-center gap-2 bg-primary/10 px-4 py-3">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Audit-ready, defensible verdicts</span>
          </div>
        </div>
      </div>
    </section>
  );
}
