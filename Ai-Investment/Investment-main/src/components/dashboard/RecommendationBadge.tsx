import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';
import type { Verdict } from '@/lib/types';

export function RecommendationBadge({ verdict }: { verdict: Verdict }) {
  const config =
    verdict === 'INVEST'
      ? { label: 'BUY / INVEST', icon: ShieldCheck, className: 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/35', glow: 'shadow-[0_0_24px_rgba(52,211,153,0.2)]' }
      : verdict === 'PASS'
        ? { label: 'PASS / SELL', icon: ShieldAlert, className: 'bg-red-500/15 text-red-400 ring-1 ring-red-500/35', glow: 'shadow-[0_0_24px_rgba(239,68,68,0.2)]' }
        : { label: 'HOLD', icon: AlertTriangle, className: 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/35', glow: 'shadow-[0_0_24px_rgba(245,158,11,0.2)]' };

  const Icon = config.icon;

  return (
    <motion.div
      initial={{ scale: 0.88, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-black tracking-wide ${config.className} ${config.glow}`}
    >
      <Icon className="h-4 w-4" />
      {config.label}
    </motion.div>
  );
}
