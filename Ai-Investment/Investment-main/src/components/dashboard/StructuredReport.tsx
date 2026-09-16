import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Lightbulb, Target, Activity, CheckCircle2,
  ListFilter, Search, BookOpen, AlertCircle, ChevronDown,
  ChevronUp, Download, FileText, Printer, Sparkles, Layers, Clock, ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
  company?: string;
  ticker?: string;
};

// Expandable Glass Card Container
function ExpandableCard({
  title,
  icon: Icon,
  children,
  badgeText,
  defaultExpanded = true,
  className = ""
}: {
  title: string;
  icon?: any;
  children: React.ReactNode;
  badgeText?: string;
  defaultExpanded?: boolean;
  className?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`group rounded-2xl border border-white/10 bg-[#090d16]/80 backdrop-blur-xl shadow-lg transition-all duration-300 hover:border-emerald-500/30 overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 text-left border-b border-white/5 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner">
              <Icon className="h-4.5 w-4.5" />
            </div>
          )}
          <div>
            <h3 className="font-black tracking-tight text-white text-base">{title}</h3>
            {badgeText && <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{badgeText}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-zinc-400 group-hover:text-white transition-colors">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="p-5 text-xs text-zinc-300 leading-relaxed space-y-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Timeline List Component
function TimelineSection({ items, icon, title, type = 'default' }: { items?: string[]; icon?: any; title: string; type?: 'default' | 'positive' | 'negative' }) {
  if (!items || items.length === 0) return null;
  const bulletColor = type === 'positive' ? 'bg-emerald-400' : type === 'negative' ? 'bg-rose-400' : 'bg-blue-400';
  const badgeType = type === 'positive' ? 'Bull Signal' : type === 'negative' ? 'Bear Risk' : 'Key Metric';

  return (
    <ExpandableCard title={title} icon={icon} badgeText={badgeType}>
      <div className="relative border-l border-white/10 pl-5 ml-2 space-y-4 my-1">
        {items.map((item, idx) => (
          <div key={idx} className="relative group">
            <span className={`absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full ${bulletColor} ring-4 ring-[#090d16] shadow-sm`} />
            <div className="text-zinc-200 text-xs font-medium leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/5 group-hover:border-white/10 transition-colors">
              {item}
            </div>
          </div>
        ))}
      </div>
    </ExpandableCard>
  );
}

export function StructuredReport({ data }: { data: ReportData }) {
  if (!data) return null;

  const [activeSection, setActiveSection] = useState<string>('all');
  const confidenceScore = Math.min(100, Math.max(0, data.confidence || 85));

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.ticker || 'Report'}_AI_Evaluation.json`;
    a.click();
    toast.success('Downloaded JSON report');
  };

  const handleExportMD = () => {
    let md = `# AI Evaluation Report: ${data.company || 'Equity'} (${data.ticker || 'N/A'})\n\n`;
    if (data.executiveSummary) md += `## Executive Summary\n${data.executiveSummary.join('\n\n')}\n\n`;
    if (data.investmentRecommendation) md += `## Verdict: ${data.investmentRecommendation}\n\n`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.ticker || 'Report'}_AI_Evaluation.md`;
    a.click();
    toast.success('Downloaded Markdown report');
  };

  const navTabs = [
    { id: 'all', label: 'All Sections' },
    { id: 'summary', label: 'Summary' },
    { id: 'bullbear', label: 'Bull / Bear' },
    { id: 'swot', label: 'SWOT Analysis' },
    { id: 'financials', label: 'Financials' },
    { id: 'risks', label: 'Risks & News' },
  ];

  return (
    <div className="space-y-6">

      {/* Sticky Quick-Nav & Export Bar */}
      <div className="sticky top-14 z-30 flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl border border-white/10 bg-[#090d16]/90 backdrop-blur-2xl shadow-xl">
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto scrollbar-none py-0.5">
          {navTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeSection === tab.id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <Button onClick={handleExportMD} variant="outline" size="sm" className="h-8 text-[11px] font-bold border-white/10 bg-white/5 text-zinc-300 hover:text-white">
            <Download className="h-3.5 w-3.5 mr-1" /> MD
          </Button>
          <Button onClick={handleExportJSON} variant="outline" size="sm" className="h-8 text-[11px] font-bold border-white/10 bg-white/5 text-zinc-300 hover:text-white">
            <FileText className="h-3.5 w-3.5 mr-1" /> JSON
          </Button>
          <Button onClick={() => window.print()} variant="outline" size="sm" className="h-8 text-[11px] font-bold border-white/10 bg-white/5 text-zinc-300 hover:text-white">
            <Printer className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* AI Confidence Meter Card */}
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-[#090d16] to-[#090d16] p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-inner">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white">Algorithm Confidence Rating</h4>
            <p className="text-xs text-zinc-400 font-medium">Multi-factor score based on fundamentals, sentiment & volatility</p>
          </div>
        </div>

        <div className="w-full sm:w-64 space-y-1.5">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-zinc-400">Certainty Level</span>
            <span className="text-emerald-400 font-mono">{confidenceScore}%</span>
          </div>
          <div className="h-2.5 w-full bg-black/50 rounded-full overflow-hidden border border-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confidenceScore}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.5)]"
            />
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      {(activeSection === 'all' || activeSection === 'summary') && (
        <ExpandableCard title="Executive Summary" icon={BookOpen} badgeText="Overview">
          <div className="space-y-3">
            {data.executiveSummary?.map((p, i) => (
              <p key={i} className="text-xs text-zinc-300 leading-relaxed font-medium">{p}</p>
            ))}
          </div>
        </ExpandableCard>
      )}

      {/* Bull & Bear Arguments */}
      {(activeSection === 'all' || activeSection === 'bullbear') && (
        <div className="grid gap-6 md:grid-cols-2">
          <TimelineSection title="Bull Case Arguments" icon={TrendingUp} items={data.bullCase} type="positive" />
          <TimelineSection title="Bear Case Risks" icon={TrendingDown} items={data.bearCase} type="negative" />
        </div>
      )}

      {/* SWOT Analysis Matrix */}
      {(activeSection === 'all' || activeSection === 'swot') && data.swot && (
        <div className="grid gap-6 md:grid-cols-2">
          <TimelineSection title="Strengths" icon={TrendingUp} items={data.swot.strengths} type="positive" />
          <TimelineSection title="Weaknesses" icon={TrendingDown} items={data.swot.weaknesses} type="negative" />
          <TimelineSection title="Opportunities" icon={Lightbulb} items={data.swot.opportunities} type="positive" />
          <TimelineSection title="Threats" icon={ShieldAlert} items={data.swot.threats} type="negative" />
        </div>
      )}

      {/* Financials & Business Breakdown */}
      {(activeSection === 'all' || activeSection === 'financials') && (
        <div className="grid gap-6 md:grid-cols-2">
          <TimelineSection title="Financial Snapshot" icon={Activity} items={data.financialSnapshot} />
          <TimelineSection title="Financial Ratios" icon={ListFilter} items={data.financialRatios} />
          <TimelineSection title="Growth Analysis" icon={TrendingUp} items={data.growthAnalysis} type="positive" />
          <TimelineSection title="Business Model" icon={Search} items={data.businessOverview} />
        </div>
      )}

      {/* Risks, Catalysts & News */}
      {(activeSection === 'all' || activeSection === 'risks') && (
        <div className="grid gap-6 md:grid-cols-2">
          <TimelineSection title="Key Risks" icon={AlertCircle} items={data.risks} type="negative" />
          <TimelineSection title="Growth Catalysts" icon={Target} items={data.opportunities} type="positive" />
          <TimelineSection title="Competitor Benchmarking" icon={Layers} items={data.competitors} />
          <TimelineSection title="Recent News Insights" icon={Clock} items={data.recentNews} />
        </div>
      )}

      {/* Final Investment Verdict */}
      <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-[#090d16] to-[#090d16] p-6 shadow-xl relative overflow-hidden">
        <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
        
        <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-4">
          <CheckCircle2 className="h-6 w-6 text-emerald-400" />
          <div>
            <h2 className="text-lg font-black tracking-tight text-white">Final Analyst Recommendation</h2>
            <p className="text-xs text-zinc-400 font-medium">Consensus synthesis generated by multi-agent research pipeline</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 pt-2">
          <div className="bg-black/40 p-4 rounded-xl border border-white/5">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Target Action</span>
            <p className="text-2xl font-black text-emerald-400 tracking-tight">{data.investmentRecommendation || data.verdict || 'HOLD'}</p>
          </div>

          <div className="bg-black/40 p-4 rounded-xl border border-white/5">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">Analytical Conclusion</span>
            <p className="text-xs text-zinc-300 font-semibold leading-relaxed mt-1">{data.finalVerdict || 'Further research recommended before position sizing.'}</p>
          </div>
        </div>
      </div>

    </div>
  );
}
