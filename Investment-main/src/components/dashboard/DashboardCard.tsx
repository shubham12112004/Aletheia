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
        'rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_12px_35px_rgba(15,23,42,0.07)] backdrop-blur-sm transition-shadow duration-300 hover:shadow-[0_18px_45px_rgba(15,23,42,0.10)] sm:p-6',
        className
      )}
    >
      {children}
    </motion.section>
  );
}
