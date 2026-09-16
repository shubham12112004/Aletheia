import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type DashboardCardProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  glow?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'success' | 'warning' | 'danger';
};

export function DashboardCard({ 
  children, 
  className, 
  delay = 0, 
  glow = false, 
  onClick,
  variant = 'default'
}: DashboardCardProps) {
  const variantStyles = {
    default: 'border-white/10 hover:border-emerald-500/30 hover:shadow-emerald-500/5',
    success: 'border-emerald-500/30 ring-1 ring-emerald-500/20 bg-emerald-500/[0.02] hover:shadow-emerald-500/10',
    warning: 'border-amber-500/30 ring-1 ring-amber-500/20 bg-amber-500/[0.02] hover:shadow-amber-500/10',
    danger: 'border-rose-500/30 ring-1 ring-rose-500/20 bg-rose-500/[0.02] hover:shadow-rose-500/10',
  };

  return (
    <motion.section
      onClick={onClick}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={onClick ? { scale: 1.02 } : { y: -2 }}
      className={cn(
        'group relative overflow-hidden rounded-2xl bg-[#090d16]/70 backdrop-blur-xl p-6 shadow-md transition-all duration-300',
        variantStyles[variant],
        glow && 'ring-1 ring-emerald-500/30 border-emerald-500/30 bg-emerald-500/[0.02]',
        onClick && 'cursor-pointer active:scale-95',
        className
      )}
    >
      {/* Top Border Glow Highlight */}
      <div className={cn(
        'pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100',
        `via-${variant === 'default' ? 'emerald' : variant === 'warning' ? 'amber' : variant === 'danger' ? 'rose' : 'emerald'}-500/40`
      )} style={{
        backgroundImage: `linear-gradient(to right, transparent, ${
          variant === 'default' ? 'rgba(16, 185, 129, 0.4)' : 
          variant === 'warning' ? 'rgba(251, 191, 36, 0.4)' : 
          variant === 'danger' ? 'rgba(244, 63, 94, 0.4)' : 
          'rgba(16, 185, 129, 0.4)'
        }, transparent)`
      }} />
      
      {/* Subtle corner glow on hover */}
      <div className={cn(
        'pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-40',
        variant === 'default' && 'bg-emerald-500/20',
        variant === 'success' && 'bg-emerald-500/20',
        variant === 'warning' && 'bg-amber-500/20',
        variant === 'danger' && 'bg-rose-500/20',
      )} />
      
      {children}
    </motion.section>
  );
}
