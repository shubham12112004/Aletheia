import { motion } from 'framer-motion';
import { BrainCircuit, CheckCircle2, Loader2, Network } from 'lucide-react';
import type { ArchStep } from '@/lib/types';
import { cn } from '@/lib/utils';

const fallbackLabels = [
  'Searching Company',
  'Company Profile Found',
  'Financial Data Collected',
  'Latest News Analyzed',
  'Web Research Completed',
  'AI is Thinking',
  'Building Investment Report',
];

export function ProcessingPipeline({
  steps,
  progress,
  phase,
}: {
  steps: ArchStep[];
  progress: number;
  phase: string;
}) {
  const visibleSteps = steps.length ? steps : fallbackLabels.map((title, index) => ({
    id: title,
    index: index + 1,
    title,
    subtitle: '',
    description: '',
    detail: '',
    status: 'pending' as const,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-3xl rounded-3xl border border-blue-100 bg-white/90 p-6 shadow-[0_24px_80px_rgba(37,99,235,0.14)] backdrop-blur-xl"
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
          <BrainCircuit className="h-8 w-8" />
          <span className="absolute inset-0 rounded-2xl border border-blue-300/80 animate-ping" />
        </div>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-600">AI Research Pipeline</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Building your investment report</h2>
        <p className="mt-2 max-w-xl text-sm text-slate-500">
          Progress is driven by backend research events as each agent finishes its work.
        </p>
      </div>

      <div className="mt-6 space-y-2.5">
        {visibleSteps.slice(0, 7).map((step, index) => {
          const done = step.status === 'done';
          const active = step.status === 'active';
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'relative flex items-center gap-3 rounded-xl border px-3 py-2.5',
                done && 'border-emerald-200 bg-emerald-50 text-emerald-800',
                active && 'border-blue-200 bg-blue-50 text-blue-800 shadow-sm shadow-blue-500/10',
                !done && !active && 'border-slate-200 bg-slate-50 text-slate-500'
              )}
            >
              {done ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : active ? (
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              ) : (
                <Network className="h-5 w-5 text-slate-400" />
              )}
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-sm font-semibold">{step.title}</p>
                <p className="truncate text-xs opacity-70">{active ? step.detail : step.description || 'Waiting for backend event'}</p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                {done ? 'done' : active ? 'running' : 'queued'}
              </span>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>{phase.replace(/-/g, ' ')}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-emerald-500 shadow-[0_0_18px_rgba(37,99,235,0.45)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          />
        </div>
      </div>
    </motion.div>
  );
}
