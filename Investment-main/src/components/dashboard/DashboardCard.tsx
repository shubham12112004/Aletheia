import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type DashboardCardProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

export function DashboardCard({ children, className, delay = 0 }: DashboardCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      className={cn(
        'rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm',
        className
      )}
    >
      {children}
    </motion.section>
  );
}
