import { TrendingUp, TrendingDown, Lightbulb, Target, Activity, CheckCircle2, AlertTriangle, ListFilter, Search, BookOpen, AlertCircle } from "lucide-react";

type SWOT = {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
};

type ReportData = {
  executiveSummary?: string[];
  businessOverview?: string[];
  financialSnapshot?: string[];
  growthAnalysis?: string[];
  financialRatios?: string[];
  swot?: SWOT;
  competitors?: string[];
  recentNews?: string[];
  risks?: string[];
  opportunities?: string[];
  bullCase?: string[];
  bearCase?: string[];
  investmentRecommendation?: string;
  finalVerdict?: string;
  verdict?: string;
  confidence?: number;
};

function Card({ title, icon: Icon, children, className = "" }: { title: string, icon?: any, children: React.ReactNode, className?: string }) {
  return (
    <div className={`rounded-xl border border-border/50 bg-card/50 p-6 shadow-sm ${className}`}>
      <div className="flex items-center gap-2 mb-4 border-b border-border/20 pb-2">
        {Icon && <Icon className="h-5 w-5 text-emerald-500" />}
        <h3 className="font-bold tracking-tight text-foreground">{title}</h3>
      </div>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  );
}

function ListSection({ items, icon, title, type = 'default' }: { items?: string[], icon?: any, title: string, type?: 'default' | 'positive' | 'negative' }) {
  if (!items || items.length === 0) return null;
  const bulletColor = type === 'positive' ? 'bg-emerald-500' : type === 'negative' ? 'bg-rose-500' : 'bg-blue-500';

  return (
    <Card title={title} icon={icon}>
      <ul className="space-y-3">
        {items.map((item, idx) => (
          <li key={idx} className="flex gap-3">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${bulletColor}`} />
            <span className="text-foreground/90">{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function StructuredReport({ data }: { data: ReportData }) {
  if (!data) return null;

  return (
    <div className="space-y-6">
      
      {/* Top Level Summary */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Executive Summary" icon={BookOpen} className="md:col-span-2">
          {data.executiveSummary?.map((p, i) => (
            <p key={i} className="text-base text-foreground/90">{p}</p>
          ))}
        </Card>
      </div>

      {/* Primary Arguments */}
      <div className="grid gap-6 md:grid-cols-2">
        <ListSection title="Bull Case" icon={TrendingUp} items={data.bullCase} type="positive" />
        <ListSection title="Bear Case" icon={TrendingDown} items={data.bearCase} type="negative" />
      </div>

      {/* SWOT Analysis */}
      {data.swot && (
        <div className="grid gap-6 md:grid-cols-2">
          <ListSection title="Strengths" icon={TrendingUp} items={data.swot.strengths} type="positive" />
          <ListSection title="Weaknesses" icon={TrendingDown} items={data.swot.weaknesses} type="negative" />
          <ListSection title="Opportunities" icon={Lightbulb} items={data.swot.opportunities} type="positive" />
          <ListSection title="Threats" icon={AlertTriangle} items={data.swot.threats} type="negative" />
        </div>
      )}

      {/* Financials & Business */}
      <div className="grid gap-6 md:grid-cols-2">
        <ListSection title="Financial Snapshot" icon={Activity} items={data.financialSnapshot} />
        <ListSection title="Financial Ratios" icon={ListFilter} items={data.financialRatios} />
        <ListSection title="Growth Analysis" icon={TrendingUp} items={data.growthAnalysis} />
        <ListSection title="Business Overview" icon={Search} items={data.businessOverview} />
      </div>

      {/* Risks & Opportunities */}
      <div className="grid gap-6 md:grid-cols-2">
        <ListSection title="Key Risks" icon={AlertCircle} items={data.risks} type="negative" />
        <ListSection title="Catalysts & Opportunities" icon={Target} items={data.opportunities} type="positive" />
      </div>

      {/* Other Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <ListSection title="Competitor Analysis" icon={ListFilter} items={data.competitors} />
        <ListSection title="Recent News Insights" icon={BookOpen} items={data.recentNews} />
      </div>

      {/* Final Verdict */}
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 shadow-sm mt-8">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          <h2 className="text-xl font-black tracking-tight text-foreground">Final Investment Verdict</h2>
        </div>
        <div className="space-y-4">
          <div>
            <span className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Recommendation</span>
            <p className="text-lg font-bold text-foreground mt-1">{data.investmentRecommendation || data.verdict}</p>
          </div>
          <div>
            <span className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Conclusion</span>
            <p className="text-base text-foreground/90 mt-1">{data.finalVerdict}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
