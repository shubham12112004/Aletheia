import { Search, Sparkles, ArrowRight, Gauge, Scale, Landmark, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { MACRO_SCENARIOS } from '@/lib/mockData';
import type { FocusFilters, MacroScenario } from '@/lib/types';

type Props = {
  company: string;
  setCompany: (v: string) => void;
  scenario: MacroScenario;
  setScenario: (s: MacroScenario) => void;
  focus: FocusFilters;
  toggleFocus: (key: keyof FocusFilters) => void;
  onRun: () => void;
  running: boolean;
};

const TONE_DOT: Record<MacroScenario['tone'], string> = {
  negative: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]',
  caution: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]',
  neutral: 'bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]',
  positive: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
};

const TONE_RING: Record<MacroScenario['tone'], string> = {
  negative: 'border-red-500/40 bg-red-500/10 text-red-400',
  caution: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
  neutral: 'border-sky-500/40 bg-sky-500/10 text-sky-400',
  positive: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
};

export const ControlsZone = memo(function ControlsZone({
  company,
  setCompany,
  scenario,
  setScenario,
  focus,
  toggleFocus,
  onRun,
  running,
}: Props) {
  const canRun = company.trim().length > 0 && !running;
  const activeIndex = MACRO_SCENARIOS.findIndex((s) => s.id === scenario.id);

  return (
    <div className="flex flex-col gap-4">
      {/* Target input card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl border border-zinc-800/50 bg-zinc-900/35 p-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-xl hover:border-zinc-700/40 transition-colors duration-300"
      >
        <div className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          <Search className="h-3.5 w-3.5 text-primary" />
          Target
        </div>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <div className="relative flex-1 group">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 group-focus-within:text-primary transition-colors" />
            <Input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && canRun && onRun()}
              placeholder="Company or ticker (Apple, TSLA...)"
              className="h-11 rounded-lg border-zinc-800/80 bg-zinc-950/60 pl-9 pr-3 text-sm shadow-inner focus-visible:ring-primary/40 focus-visible:border-primary/50 transition-all duration-300 text-zinc-100 placeholder:text-zinc-600"
              disabled={running}
              aria-label="Company name or ticker"
            />
          </div>
          <Button
            onClick={onRun}
            disabled={!canRun}
            className="group h-11 gap-2 rounded-lg bg-primary px-4.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:brightness-110 hover:shadow-primary/45 disabled:opacity-50 disabled:pointer-events-none"
          >
            <Sparkles className="h-4 w-4 transition-transform group-hover:rotate-12" />
            Run Research
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </motion.div>

      {/* Stress-test regime slider card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="rounded-2xl border border-zinc-800/50 bg-zinc-900/35 p-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-xl hover:border-zinc-700/40 transition-colors duration-300"
      >
        <div className="mb-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            <Gauge className="h-3.5 w-3.5 text-primary animate-pulse" />
            Stress-Test Regime
          </div>
          <motion.span
            layoutId="scenario-badge"
            className={cn(
              'rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
              TONE_RING[scenario.tone]
            )}
          >
            {scenario.label}
          </motion.span>
        </div>

        {/* Custom Slider Track */}
        <div className="relative px-1 pb-2 pt-2.5">
          <div className="relative h-1.5 w-full rounded-full bg-zinc-800">
            {/* Active colored fill */}
            <motion.div
              className="absolute h-1.5 rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500"
              animate={{
                width: `${((activeIndex + 0.5) / MACRO_SCENARIOS.length) * 100}%`,
              }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            />
            {MACRO_SCENARIOS.map((s, i) => {
              const pos = (i / (MACRO_SCENARIOS.length - 1)) * 100;
              const isActive = s.id === scenario.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setScenario(s)}
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 group outline-none"
                  style={{ left: `${pos}%` }}
                  aria-label={s.label}
                >
                  <motion.span
                    animate={isActive ? { scale: 1.35 } : { scale: 1 }}
                    className={cn(
                      'block h-3.5 w-3.5 rounded-full border-2 transition-all cursor-pointer',
                      isActive
                        ? 'border-zinc-100 bg-primary shadow-md shadow-primary/40'
                        : 'border-zinc-700 bg-zinc-950 group-hover:border-zinc-500'
                    )}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Regime Buttons Grid */}
        <div className="mt-4.5 grid grid-cols-4 gap-1.5">
          {MACRO_SCENARIOS.map((s) => {
            const isActive = s.id === scenario.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setScenario(s)}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl border p-2 text-center transition-all duration-300 relative',
                  isActive
                    ? 'border-primary/40 bg-primary/5 shadow-sm shadow-primary/5'
                    : 'border-zinc-800/40 bg-zinc-950/20 hover:border-zinc-700/60 hover:bg-zinc-900/30'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="regime-outline"
                    className="absolute inset-0 border border-primary rounded-xl pointer-events-none"
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  />
                )}
                <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-100 uppercase tracking-wide">
                  <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', TONE_DOT[s.tone])} />
                  {s.short}
                </span>
                <span className="text-[9px] leading-tight text-zinc-400 mt-0.5">
                  {s.description}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Focus filters card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="rounded-2xl border border-zinc-800/50 bg-zinc-900/35 p-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-xl hover:border-zinc-700/40 transition-colors duration-300"
      >
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          <Scale className="h-3.5 w-3.5 text-primary" />
          Focus Filters
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <FocusToggle
            active={focus.regulatory}
            onClick={() => toggleFocus('regulatory')}
            icon={Landmark}
            label="Regulatory Deep-Dive"
            hint="Antitrust, policy risk"
            disabled={running}
          />
          <FocusToggle
            active={focus.insider}
            onClick={() => toggleFocus('insider')}
            icon={UserCheck}
            label="Insider Trading"
            hint="10b5-1 plans, sales"
            disabled={running}
          />
        </div>
      </motion.div>
    </div>
  );
});

function FocusToggle({
  active,
  onClick,
  icon: Icon,
  label,
  hint,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Landmark;
  label: string;
  hint: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'group flex items-center gap-3 rounded-xl border p-3 text-left transition-all duration-300 disabled:opacity-50',
        active
          ? 'border-primary/50 bg-primary/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
          : 'border-zinc-850 bg-zinc-950/20 hover:border-zinc-700 hover:bg-zinc-900/30'
      )}
    >
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors duration-300',
          active ? 'bg-primary/20 text-primary' : 'bg-zinc-900 text-zinc-500'
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <span
          className={cn(
            'text-xs font-semibold block transition-colors leading-none',
            active ? 'text-zinc-100' : 'text-zinc-400'
          )}
        >
          {label}
        </span>
        <p className="mt-1 text-[10px] text-zinc-500 leading-normal truncate">{hint}</p>
      </div>
      <span
        className={cn(
          'relative h-5 w-9 shrink-0 rounded-full transition-colors duration-350 cursor-pointer',
          active ? 'bg-primary' : 'bg-zinc-800'
        )}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={cn(
            'absolute top-0.5 h-4 w-4 rounded-full bg-background shadow',
            active ? 'left-[18px]' : 'left-0.5'
          )}
        />
      </span>
    </button>
  );
}
