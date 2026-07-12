import {
  Search,
  Building2,
  FileText,
  Percent,
  Newspaper,
  Globe,
  Smile,
  Brain,
  ShieldAlert,
  Target,
  FileCheck2,
  Check,
  Loader2,
  Circle,
  GitBranch,
  XCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { memo } from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { ArchStep } from '@/lib/types';

type Props = {
  steps: ArchStep[];
  progress: number;
  running: boolean;
};

// Map node IDs to unique Lucide icons
function getStepIcon(id: string) {
  switch (id) {
    case 'company-validation':
      return Search;
    case 'company-profile':
      return Building2;
    case 'financial-statements':
      return FileText;
    case 'stock-metrics':
      return Percent;
    case 'latest-news':
      return Newspaper;
    case 'tavily-web-search':
      return Globe;
    case 'news-sentiment':
      return Smile;
    case 'swot-generator':
      return Brain;
    case 'risk-assessment':
      return ShieldAlert;
    case 'investment-score':
      return Target;
    case 'recommendation-generator':
      return FileCheck2;
    default:
      return Circle;
  }
}

// Map backend step status to requested status labels and tailwind colors
const STATUS_MAP = {
  pending: {
    label: 'Waiting',
    badgeClass: 'bg-zinc-800/60 text-zinc-400 border-zinc-700/50',
    markerClass: 'border-zinc-700 bg-zinc-900/50 text-zinc-500',
    cardClass: 'border-zinc-800/40 bg-zinc-900/10 opacity-50',
  },
  active: {
    label: 'Running',
    badgeClass: 'bg-sky-500/10 text-sky-400 border-sky-500/30 animate-pulse',
    markerClass: 'border-sky-500 bg-sky-950/20 text-sky-400 shadow-lg shadow-sky-500/20',
    cardClass: 'border-sky-500/30 bg-sky-950/10 shadow-md shadow-sky-950/5',
  },
  done: {
    label: 'Completed',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    markerClass: 'border-emerald-500 bg-emerald-500 text-emerald-950 shadow-md shadow-emerald-500/10',
    cardClass: 'border-zinc-800/70 bg-zinc-900/20',
  },
  failed: {
    label: 'Failed',
    badgeClass: 'bg-red-500/10 text-red-400 border-red-500/30',
    markerClass: 'border-red-500 bg-red-500/10 text-red-400 shadow-md shadow-red-500/20',
    cardClass: 'border-red-500/20 bg-red-500/5',
  },
} as const;

export const ArchTracker = memo(function ArchTracker({ steps, progress, running }: Props) {
  const completedCount = steps.filter((s) => s.status === 'done').length;

  return (
    <div className="flex h-full flex-col rounded-2xl border border-zinc-800/50 bg-zinc-900/35 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl hover:border-zinc-700/40 transition-colors duration-300">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
            <GitBranch className="h-4 w-4 text-primary animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-zinc-100">
              Research Pipeline
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Live LangGraph Node Execution
            </p>
          </div>
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider transition-colors duration-300',
            running
              ? 'bg-primary/10 text-primary border border-primary/20'
              : 'bg-zinc-800/40 text-zinc-400 border border-zinc-700/30'
          )}
        >
          {running && <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />}
          {running ? 'Executing' : 'Idle'}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4 mt-2">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1 px-1">
          <span>Overall Progress</span>
          <span className="font-mono font-medium text-foreground">{progress}%</span>
        </div>
        <Progress
          value={progress}
          className="h-1.5 bg-zinc-800 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-teal-400 transition-all duration-500"
        />
      </div>

      {/* Pipeline Nodes List */}
      <div className="relative flex-1 overflow-y-auto pr-1 max-h-[600px] scrollbar-thin">
        {/* Background Vertical Line */}
        <div className="absolute left-[18px] top-4 bottom-4 w-px bg-zinc-800" />
        
        {/* Animated Active Progress Line */}
        <motion.div
          className="absolute left-[18px] top-4 w-px bg-gradient-to-b from-primary to-teal-400 origin-top"
          initial={{ scaleY: 0 }}
          animate={{
            scaleY: steps.length > 0 ? (completedCount / steps.length) : 0,
          }}
          transition={{ type: 'spring', stiffness: 80, damping: 15 }}
          style={{ height: 'calc(100% - 32px)' }}
        />

        <ol className="relative space-y-3.5">
          {steps.map((step, i) => {
            const StepIcon = getStepIcon(step.id);
            const statusConfig = STATUS_MAP[step.status];
            const isActive = step.status === 'active';
            const isDone = step.status === 'done';
            const isFailed = step.status === 'failed';

            return (
              <motion.li
                key={step.id}
                layout="position"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25, delay: i * 0.03 }}
                className={cn('relative flex gap-3.5 items-start')}
              >
                {/* Node Status Marker */}
                <div className="relative z-10 shrink-0 mt-0.5">
                  <motion.div
                    animate={isActive ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                    transition={isActive ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-300',
                      statusConfig.markerClass
                    )}
                  >
                    {isDone ? (
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                      >
                        <Check className="h-4 w-4" />
                      </motion.div>
                    ) : isFailed ? (
                      <XCircle className="h-4.5 w-4.5 animate-bounce" />
                    ) : isActive ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <StepIcon className="h-4.5 w-4.5" />
                    )}
                  </motion.div>
                </div>

                {/* Node Details Card */}
                <motion.div
                  layout
                  className={cn(
                    'flex-1 rounded-xl border p-3 transition-all duration-300',
                    statusConfig.cardClass
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-mono text-[9px] text-muted-foreground shrink-0 bg-zinc-800/40 px-1.5 py-0.5 rounded border border-zinc-700/20">
                        {String(step.index).padStart(2, '0')}
                      </span>
                      <h4 className="text-xs font-semibold leading-none truncate text-foreground">
                        {step.title}
                      </h4>
                    </div>

                    {/* Status Badge */}
                    <motion.span
                      layout="position"
                      className={cn(
                        'shrink-0 rounded-full border px-2 py-0.5 font-mono text-[8px] uppercase tracking-wider',
                        statusConfig.badgeClass
                      )}
                    >
                      {statusConfig.label}
                    </motion.span>
                  </div>

                  <p className="mt-1 font-mono text-[9px] text-muted-foreground truncate">
                    {step.subtitle}
                  </p>

                  <AnimatePresence mode="wait">
                    <motion.p
                      key={isActive ? 'detail' : 'desc'}
                      initial={{ opacity: 0, y: -2 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 2 }}
                      transition={{ duration: 0.15 }}
                      className="mt-1.5 text-[11px] leading-normal text-muted-foreground"
                    >
                      {isFailed
                        ? 'This node failed execution and aborted the process.'
                        : isActive
                        ? step.detail
                        : step.description}
                    </motion.p>
                  </AnimatePresence>
                </motion.div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </div>
  );
});
