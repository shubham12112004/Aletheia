import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type DashboardCardProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  glow?: boolean;
};

export function DashboardCard({ children, className, delay = 0, glow = false }: DashboardCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      className={cn(
        'group relative overflow-hidden rounded-3xl border border-white/8 bg-white/4 p-5 backdrop-blur-sm transition-all duration-300',
        'hover:border-white/12 hover:bg-white/6',
        glow && 'shadow-emerald-glow',
        className
      )}
    >
      {/* Gradient inner border top */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      {children}
    </motion.section>
  );
}
