import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h3 className="text-lg font-black tracking-tight text-white">{title}</h3>
      <p className="mt-1 text-sm text-zinc-600">{subtitle}</p>
    </div>
  );
}

export function SettingBlock({ 
  icon: Icon, 
  title, 
  subtitle, 
  children 
}: { 
  icon: LucideIcon; 
  title: string; 
  subtitle: string; 
  children: React.ReactNode; 
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-emerald-500/12 p-3 text-emerald-400 ring-1 ring-emerald-500/20">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-black text-white">{title}</p>
          <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function SegmentedControl({ 
  value, 
  options, 
  onChange 
}: { 
  value: string; 
  options: Array<[string, string]>; 
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-white/10 bg-white/4 p-1">
      {options.map(([id, label]) => (
        <button 
          key={id} 
          type="button" 
          onClick={() => onChange(id)} 
          className={cn(
            'rounded-full px-4 py-2 text-sm font-bold transition', 
            value === id ? 'bg-emerald-500 text-[#05080f] shadow-md' : 'text-zinc-500 hover:text-zinc-300'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ 
  label, 
  checked, 
  onChange 
}: { 
  label: string; 
  checked: boolean; 
  onChange: (v: boolean) => void;
}) {
  return (
    <button 
      type="button" 
      onClick={() => onChange(!checked)} 
      className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/3 p-3 text-left transition hover:border-white/12 hover:bg-white/5"
    >
      <span className="text-sm font-bold text-zinc-300">{label}</span>
      <span className={cn('relative h-6 w-11 rounded-full transition-colors', checked ? 'bg-emerald-500' : 'bg-white/12')}>
        <span className={cn('absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all', checked ? 'left-6' : 'left-1')} />
      </span>
    </button>
  );
}
