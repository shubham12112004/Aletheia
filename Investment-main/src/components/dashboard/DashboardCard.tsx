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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-white/10 bg-[#090d16]/70 backdrop-blur-xl p-6 shadow-md transition-all duration-300',
        'hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-0.5',
        glow && 'ring-1 ring-emerald-500/30 border-emerald-500/30 bg-emerald-500/[0.02]',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {/* Top Border Glow Highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      {children}
    </motion.section>
  );
}
