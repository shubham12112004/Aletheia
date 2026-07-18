import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type DashboardCardProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  glow?: boolean;
  onClick?: () => void;
};

export function DashboardCard({ children, className, delay = 0, glow = false, onClick }: DashboardCardProps) {
  return (
    <motion.section
      onClick={onClick}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: 'easeOut' }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300',
        'hover:border-border/80 hover:shadow-lg hover:-translate-y-0.5',
        glow && 'ring-1 ring-primary/20',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {/* Gradient inner border top */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      {children}
    </motion.section>
  );
}
