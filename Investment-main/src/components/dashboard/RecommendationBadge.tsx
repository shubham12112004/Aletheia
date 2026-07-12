import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';
import type { Verdict } from '@/lib/types';

export function RecommendationBadge({ verdict }: { verdict: Verdict }) {
  const config =
    verdict === 'INVEST'
      ? { label: 'BUY', icon: ShieldCheck, className: 'bg-emerald-500 text-white shadow-emerald-500/25' }
      : verdict === 'PASS'
        ? { label: 'SELL', icon: ShieldAlert, className: 'bg-red-500 text-white shadow-red-500/25' }
        : { label: 'HOLD', icon: AlertTriangle, className: 'bg-amber-400 text-slate-950 shadow-amber-400/25' };

  const Icon = config.icon;

  return (
    <motion.div
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-black tracking-wide shadow-lg ${config.className}`}
    >
      <Icon className="h-4 w-4" />
      {config.label}
    </motion.div>
  );
}
