import { useEffect, useState } from 'react';
import { Database, Network, ShieldCheck, Gavel, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

type Node = {
  id: string;
  label: string;
  sub: string;
  icon: typeof Database;
  x: number;
  y: number;
};

const NODES: Node[] = [
  { id: 'data', label: 'Data Aggregator', sub: 'Tavily · EDGAR', icon: Database, x: 12, y: 50 },
  { id: 'fund', label: 'Fundamentals', sub: 'agent', icon: Activity, x: 40, y: 18 },
  { id: 'moat', label: 'Moat Analyst', sub: 'agent', icon: Network, x: 40, y: 82 },
  { id: 'critic', label: 'Critic Guardrail', sub: 'self-reflection', icon: ShieldCheck, x: 68, y: 50 },
  { id: 'verdict', label: 'Verdict', sub: 'compile', icon: Gavel, x: 90, y: 50 },
];

const EDGES: [string, string][] = [
  ['data', 'fund'],
  ['data', 'moat'],
  ['fund', 'critic'],
  ['moat', 'critic'],
  ['critic', 'verdict'],
];

function nodeById(id: string) {
  return NODES.find((n) => n.id === id)!;
}

export function AgentNetworkMap() {
  // cycle an "active edge" to simulate data flowing through the graph
  const [activeEdge, setActiveEdge] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      setActiveEdge((e) => (e + 1) % EDGES.length);
    }, 1100);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border/70 glass-strong shadow-2xl">
      {/* top bar */}
      <div className="flex items-center justify-between border-b border-border/60 bg-background/40 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
          </div>
          <span className="ml-2 font-mono text-[11px] text-muted-foreground">
            agent_network.live
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
          5 nodes · 5 edges
        </span>
      </div>

      {/* graph canvas */}
      <div className="relative h-[260px] w-full sm:h-[300px]">
        {/* faint grid */}
        <div className="absolute inset-0 bg-grid-fine opacity-30" />
        <div className="absolute inset-0 bg-hero-mesh opacity-60" />

        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          {EDGES.map(([from, to], i) => {
            const a = nodeById(from);
            const b = nodeById(to);
            const isActive = i === activeEdge;
            return (
              <line
                key={`${from}-${to}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={isActive ? 'hsl(152 62% 50%)' : 'hsl(217 33% 30%)'}
                strokeWidth={isActive ? 0.6 : 0.3}
                className={isActive ? 'animate-dash-flow' : undefined}
                style={isActive ? { filter: 'drop-shadow(0 0 2px hsl(152 62% 50%))' } : undefined}
              />
            );
          })}
        </svg>

        {/* nodes */}
        {NODES.map((n) => {
          const Icon = n.icon;
          const isHub = n.id === 'critic' || n.id === 'data';
          return (
            <div
              key={n.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
            >
              <div className="relative">
                {isHub && (
                  <span className="absolute inset-0 rounded-xl border border-primary/40 animate-node-ping" />
                )}
                <div
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-xl border bg-card/80 shadow-lg backdrop-blur-sm transition-all sm:h-12 sm:w-12',
                    isHub
                      ? 'border-primary/50 text-primary'
                      : 'border-border/70 text-foreground/80'
                  )}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div className="absolute left-1/2 top-full mt-1.5 w-max -translate-x-1/2 text-center">
                  <p className="text-[10px] font-semibold leading-tight text-foreground">
                    {n.label}
                  </p>
                  <p className="font-mono text-[9px] leading-tight text-muted-foreground">
                    {n.sub}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* footer status */}
      <div className="grid grid-cols-3 gap-px border-t border-border/60 bg-border/40 text-center">
        {[
          { k: 'Throughput', v: '1.2k tok/s' },
          { k: 'Critic passes', v: '4 / 4' },
          { k: 'Citations', v: '12 verified' },
        ].map((s) => (
          <div key={s.k} className="bg-card/60 px-2 py-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.k}</p>
            <p className="text-xs font-semibold text-foreground">{s.v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
