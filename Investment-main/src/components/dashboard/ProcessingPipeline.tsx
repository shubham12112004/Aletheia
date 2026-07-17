import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, CheckCircle2, Loader2, Link, Terminal, Database, Cpu, Network } from 'lucide-react';
import type { ArchStep } from '@/lib/types';
import { cn } from '@/lib/utils';

// Nodes along the sine wave path (y: 130 to 210)
const GRAPH_NODES = [
  { id: 'company-validation', label: 'VAL', title: 'Validation', x: 60, y: 170, endpoint: 'fmp', desc: 'FMP Sandbox Verification' },
  { id: 'company-profile', label: 'PROF', title: 'Profile', x: 130, y: 130, endpoint: 'fmp', desc: 'FMP Profile Ingestion' },
  { id: 'financial-statements', label: 'FIN', title: 'Financials', x: 200, y: 210, endpoint: 'fmp', desc: 'Statements Aggregation' },
  { id: 'stock-metrics', label: 'MET', title: 'Metrics', x: 270, y: 170, endpoint: 'fmp', desc: 'Ratio Calculations' },
  { id: 'latest-news', label: 'NEWS', title: 'News', x: 340, y: 130, endpoint: 'news', desc: 'NewsAPI Headlines Parse' },
  { id: 'tavily-web-search', label: 'WEB', title: 'Tavily', x: 410, y: 210, endpoint: 'tavily', desc: 'Tavily Context Fetch' },
  { id: 'news-sentiment', label: 'SENT', title: 'Sentiment', x: 480, y: 170, endpoint: 'gemini', desc: 'Gemini Tone Classify' },
  { id: 'swot-generator', label: 'SWOT', title: 'SWOT', x: 550, y: 130, endpoint: 'gemini', desc: 'SWOT Matrix Generator' },
  { id: 'risk-assessment', label: 'RISK', title: 'Risk', x: 620, y: 210, endpoint: 'gemini', desc: 'Multi-Factor Assessment' },
  { id: 'investment-score', label: 'SCORE', title: 'Score', x: 690, y: 170, endpoint: 'gemini', desc: 'Weight Matrix Calculation' },
  { id: 'recommendation-generator', label: 'REC', title: 'Report', x: 760, y: 130, endpoint: 'gemini', desc: 'Final Section Assembly' }
];

// Endpoint locations at y: 40 (sitting cleanly at the top)
const ENDPOINTS = {
  fmp: { x: 165, y: 40, name: 'FMP API Endpoint', icon: Database },
  news: { x: 340, y: 40, name: 'NewsAPI Engine', icon: Database },
  tavily: { x: 480, y: 40, name: 'Tavily Web Agent', icon: Network },
  gemini: { x: 640, y: 40, name: 'Gemini LLM Chain', icon: Cpu }
};

export function ProcessingPipeline({
  steps,
  progress,
  phase,
}: {
  steps: ArchStep[];
  progress: number;
  phase: string;
}) {
  const [logs, setLogs] = useState<string[]>([]);
  const activeStep = steps.find((s) => s.status === 'active');
  const activeIndex = steps.findIndex((s) => s.status === 'active');

  // Generate real-time CLI style execution logs
  useEffect(() => {
    if (!activeStep) return;
    const items = [
      `[graph:init] Running LangGraph node: ${activeStep.id}`,
      `[chain:invoke] Invoking LangChain endpoint: ${activeStep.title}`,
      `[network:call] Directing payload to ${activeStep.detail || 'backend provider'}`,
      `[engine:status] Execution progress: ${progress}% completed`
    ];
    setLogs((prev) => [...prev, ...items].slice(-6));
  }, [activeStep, progress]);

  // Connect active step to endpoint coordinates
  const activeEndpointConnection = useMemo(() => {
    if (!activeStep) return null;
    const matchedNode = GRAPH_NODES.find((node) => node.id === activeStep.id);
    if (!matchedNode) return null;
    const matchedEndpoint = ENDPOINTS[matchedNode.endpoint as keyof typeof ENDPOINTS];
    return {
      x1: matchedNode.x,
      y1: matchedNode.y,
      x2: matchedEndpoint.x,
      y2: matchedEndpoint.y,
      endpointName: matchedEndpoint.name
    };
  }, [activeStep]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-4xl rounded-3xl border border-white/8 bg-white/4 p-6 shadow-2xl backdrop-blur-xl text-white"
    >
      {/* Header */}
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/25">
          <BrainCircuit className="h-8 w-8" />
          <span className="absolute inset-0 rounded-2xl border border-emerald-400/40 animate-ping" />
        </div>
        <div className="flex items-center gap-1.5">
          <SparklesIcon className="h-3.5 w-3.5 text-emerald-400" />
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-500">Autonomous Execution Engine</p>
        </div>
        <h2 className="mt-2 text-2xl font-black tracking-tight">Processing Research Graph...</h2>
        <p className="mt-1.5 max-w-xl text-sm text-zinc-500">
          LangGraph and LangChain nodes are orchestrating parallel data aggregation loops.
        </p>
      </div>

      {/* GRAPH & CHAIN WAVE ANIMATION */}
      <div className="relative mt-8 rounded-2xl border border-white/5 bg-zinc-950/60 p-4">
        {/* SVG visualizer */}
        <svg viewBox="0 0 820 280" className="w-full h-auto overflow-visible select-none">
          {/* Defs for gradients/glows */}
          <defs>
            <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
            </linearGradient>
            <filter id="node-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines */}
          <g className="opacity-5">
            <line x1="0" y1="170" x2="820" y2="170" stroke="#fff" strokeDasharray="3 3" />
            <line x1="0" y1="130" x2="820" y2="130" stroke="#fff" strokeDasharray="3 3" />
            <line x1="0" y1="210" x2="820" y2="210" stroke="#fff" strokeDasharray="3 3" />
            <line x1="0" y1="40" x2="820" y2="40" stroke="#fff" strokeDasharray="3 3" />
          </g>

          {/* Primary wave connection curve */}
          <path
            id="graph-sine-wave"
            d="M 60 170 Q 95 145, 130 130 T 200 210 T 270 170 T 340 130 T 410 210 T 480 170 T 550 130 T 620 210 T 690 170 T 760 130"
            fill="none"
            stroke="url(#wave-gradient)"
            strokeWidth="3.5"
            className="animate-pulse"
          />

          {/* Flow particles chasing along the curve (LangGraph Active Flow) */}
          <circle r="4" fill="#06b6d4" filter="url(#node-glow)">
            <animateMotion dur="5s" repeatCount="indefinite" path="M 60 170 Q 95 145, 130 130 T 200 210 T 270 170 T 340 130 T 410 210 T 480 170 T 550 130 T 620 210 T 690 170 T 760 130" />
          </circle>
          <circle r="4" fill="#10b981" filter="url(#node-glow)">
            <animateMotion dur="5s" begin="1.6s" repeatCount="indefinite" path="M 60 170 Q 95 145, 130 130 T 200 210 T 270 170 T 340 130 T 410 210 T 480 170 T 550 130 T 620 210 T 690 170 T 760 130" />
          </circle>
          <circle r="4" fill="#3b82f6" filter="url(#node-glow)">
            <animateMotion dur="5s" begin="3.2s" repeatCount="indefinite" path="M 60 170 Q 95 145, 130 130 T 200 210 T 270 170 T 340 130 T 410 210 T 480 170 T 550 130 T 620 210 T 690 170 T 760 130" />
          </circle>

          {/* Active flow connection curve (highlight path up to current index) */}
          {activeIndex >= 0 && (
            <path
              d={`M 60 170 ${GRAPH_NODES.slice(1, activeIndex + 1).map((node) => {
                return `L ${node.x} ${node.y}`;
              }).join(' ')}`}
              fill="none"
              stroke="#10b981"
              strokeWidth="4.5"
              strokeDasharray="6 4"
              className="animate-dash-flow"
            />
          )}

          {/* Active Chain to Endpoint (LangChain Connection) - clean flow from bottom wave to top line */}
          {activeEndpointConnection && (
            <g>
              {/* Backing glow line */}
              <line
                x1={activeEndpointConnection.x1}
                y1={activeEndpointConnection.y1}
                x2={activeEndpointConnection.x2}
                y2={activeEndpointConnection.y2}
                stroke="#06b6d4"
                strokeWidth="5"
                strokeLinecap="round"
                opacity="0.3"
                filter="url(#node-glow)"
              />
              {/* Main connecting path */}
              <line
                x1={activeEndpointConnection.x1}
                y1={activeEndpointConnection.y1}
                x2={activeEndpointConnection.x2}
                y2={activeEndpointConnection.y2}
                stroke="#10b981"
                strokeWidth="2.5"
                strokeDasharray="4 4"
                className="animate-dash-flow"
                opacity="0.9"
              />
              {/* Flow particle going UP the connection link */}
              <circle r="4.5" fill="#06b6d4" filter="url(#node-glow)">
                <animate attributeName="cx" from={activeEndpointConnection.x1} to={activeEndpointConnection.x2} dur="1.2s" repeatCount="indefinite" />
                <animate attributeName="cy" from={activeEndpointConnection.y1} to={activeEndpointConnection.y2} dur="1.2s" repeatCount="indefinite" />
              </circle>
            </g>
          )}

          {/* Draw Endpoint icons (y: 40) */}
          {Object.entries(ENDPOINTS).map(([key, ep]) => {
            const isActive = activeStep && GRAPH_NODES.find((n) => n.id === activeStep.id)?.endpoint === key;
            return (
              <g key={key} transform={`translate(${ep.x}, ${ep.y})`}>
                <circle
                  cx="0"
                  cy="0"
                  r="18"
                  className={cn(
                    'transition-all duration-300',
                    isActive ? 'fill-emerald-500/20 stroke-emerald-400 stroke-[2px]' : 'fill-zinc-900 stroke-white/10'
                  )}
                  filter={isActive ? 'url(#node-glow)' : undefined}
                />
                <ep.icon className={cn('h-4 w-4 -translate-x-2 -translate-y-2 transition-all', isActive ? 'text-emerald-400 scale-110' : 'text-zinc-500')} />
                <text x="0" y="-24" className={cn('text-[9px] font-black text-center tracking-wide', isActive ? 'fill-emerald-400' : 'fill-zinc-600')} textAnchor="middle">
                  {key.toUpperCase()}
                </text>
              </g>
            );
          })}

          {/* Draw LangGraph nodes with enhanced animations */}
          {GRAPH_NODES.map((node) => {
            const stepState = steps.find((s) => s.id === node.id);
            const isDone = stepState?.status === 'done';
            const isActive = stepState?.status === 'active';

            return (
              <g key={node.id}>
                {/* Node circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isActive ? '13' : '9'}
                  className={cn(
                    'transition-all duration-300',
                    isDone ? 'fill-emerald-500/20 stroke-emerald-400 stroke-[2px]' :
                    isActive ? 'fill-cyan-500/20 stroke-cyan-400 stroke-[2.5px] animate-pulse' :
                    'fill-zinc-950 stroke-white/10'
                  )}
                  filter={isActive ? 'url(#node-glow)' : undefined}
                />

                {isActive && (
                  <>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="22"
                      className="stroke-cyan-500/40 fill-none animate-node-ping"
                      strokeWidth="1"
                    />
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="16"
                      className="stroke-emerald-500/30 fill-none animate-node-ping"
                      strokeWidth="1.5"
                      style={{ animationDelay: '0.8s' }}
                    />
                  </>
                )}

                {/* Node Label Text */}
                <text
                  x={node.x}
                  y={node.y + 24}
                  className={cn(
                    'text-[9px] font-black tracking-tight text-center transition-colors',
                    isDone ? 'fill-emerald-400 font-bold' :
                    isActive ? 'fill-cyan-400 font-bold' :
                    'fill-zinc-600'
                  )}
                  textAnchor="middle"
                >
                  {node.title}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Split grid display */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Active execution logs */}
        <div className="flex flex-col rounded-2xl border border-white/8 bg-zinc-950/60 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Terminal className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Chain CLI Console</span>
          </div>
          <div className="flex-1 font-mono text-[11px] text-emerald-400/90 space-y-1.5 min-h-[140px] leading-relaxed">
            <AnimatePresence>
              {logs.map((log, index) => (
                <motion.div
                  key={log + index}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="truncate"
                >
                  {log}
                </motion.div>
              ))}
            </AnimatePresence>
            {!activeStep && (
              <div className="text-zinc-600 italic">Establishing LangGraph system initialization...</div>
            )}
          </div>
        </div>

        {/* Steps track display */}
        <div className="space-y-2 max-h-[180px] overflow-y-auto stream-scroll pr-1">
          {steps.map((step, index) => {
            const isDone = step.status === 'done';
            const isActive = step.status === 'active';

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className={cn(
                  'flex items-center gap-3 rounded-xl border px-3 py-2 transition',
                  isDone && 'border-emerald-500/20 bg-emerald-500/8 text-emerald-400',
                  isActive && 'border-cyan-500 bg-cyan-500/10 text-white shadow-[0_0_15px_rgba(6,182,212,0.15)]',
                  !isDone && !isActive && 'border-white/5 bg-white/2 text-zinc-500'
                )}
              >
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : isActive ? (
                  <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                ) : (
                  <Link className="h-4 w-4 text-zinc-600" />
                )}
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-xs font-semibold">{step.title}</p>
                  <p className="truncate text-[10px] opacity-70">
                    {isActive ? step.detail : step.description || 'Waiting for trigger event'}
                  </p>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider opacity-70">
                  {isDone ? 'done' : isActive ? 'running' : 'queued'}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Progress slider bar */}
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-xs font-bold tracking-tight text-zinc-400">
          <span className="uppercase text-emerald-500">{phase.replace(/-/g, ' ')}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/5">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 shadow-[0_0_18px_rgba(52,211,153,0.4)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          />
        </div>
      </div>
    </motion.div>
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5z" />
      <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1z" />
    </svg>
  );
}
