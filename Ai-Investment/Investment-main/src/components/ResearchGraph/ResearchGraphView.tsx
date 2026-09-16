import '@xyflow/react/dist/style.css';
import { Background, Controls, ReactFlow, type Edge, type Node } from '@xyflow/react';
import { Check, Circle, Loader2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ArchStep } from '@/lib/types';

// Compact graph matching the five stages emitted by the research hook.
const POSITIONS = [
  ['search', 'Search', 0, 105],
  ['profile', 'Profile', 165, 0],
  ['news', 'News', 330, 105],
  ['tavily', 'Web Research', 495, 0],
  ['groq', 'AI Report', 660, 105],
] as const;

type Status = 'pending' | 'active' | 'done' | 'failed';

// Resolve each visual node from the corresponding research step.
function statusFor(id: string, steps: ArchStep[]): Status {
  return steps.find((step) => step.id === id)?.status ?? 'pending';
}
function GraphNode({ data }: { data: { label: string; status: Status } }) {
  const isPending = data.status === 'pending';
  const isRunning = data.status === 'active';
  const isDone = data.status === 'done';
  const isFailed = data.status === 'failed';

  return (
    <motion.div
      layout="position"
      animate={
        isRunning
          ? {
              y: [0, -10, 0],
              scale: [1, 1.06, 1],
              boxShadow: [
                '0 0 0 0 rgba(56, 189, 248, 0)',
                '0 0 12px 3px rgba(56, 189, 248, 0.25)',
                '0 0 0 0 rgba(56, 189, 248, 0)',
              ],
            }
          : { y: 0, scale: 1, boxShadow: 'none' }
      }
      transition={
        isRunning
          ? { duration: 1.45, repeat: Infinity, ease: 'easeInOut' }
          : { type: 'spring', stiffness: 300, damping: 25 }
      }
      className={cn(
        'flex min-w-[130px] items-center gap-2 rounded-xl border px-3 py-2 text-xs shadow-lg backdrop-blur-md transition-colors duration-500',
        isPending && 'border-zinc-800 bg-zinc-900/60 text-zinc-500',
        isRunning && 'border-sky-500/80 bg-sky-500/10 text-sky-100 border-sky-400',
        isDone && 'border-emerald-500/70 bg-emerald-500/15 text-emerald-100',
        isFailed && 'border-red-500/80 bg-red-500/15 text-red-100'
      )}
    >
      <div className="shrink-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isDone ? (
            <motion.div
              key="done"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Check className="h-4 w-4 text-emerald-400" />
            </motion.div>
          ) : isRunning ? (
            <motion.div
              key="running"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="h-4 w-4 text-sky-400" />
            </motion.div>
          ) : isFailed ? (
            <motion.div
              key="failed"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <XCircle className="h-4 w-4 text-red-400" />
            </motion.div>
          ) : (
            <motion.div
              key="pending"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0.5 }}
            >
              <Circle className="h-3.5 w-3.5 text-zinc-600" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <span className="font-semibold tracking-wide font-sans">{data.label}</span>
    </motion.div>
  );
}

const nodeTypes = { research: GraphNode };

export function ResearchGraphView({ steps }: { steps: ArchStep[] }) {
  // Generate nodes from the current research stages.
  const nodes: Node[] = POSITIONS.map(([id, label, x, y]) => ({
    id,
    type: 'research',
    position: { x, y },
    data: { label, status: statusFor(id, steps) },
    draggable: false,
  }));

  // Generate animated React Flow Edges representing pipeline progress
  const edges: Edge[] = POSITIONS.slice(0, -1).map(([id], index) => {
    const next = POSITIONS[index + 1][0];
    const status = statusFor(next, steps);
    const prevStatus = statusFor(id, steps);

    // Active flow edge indicator
    const isActive = status === 'active' || (prevStatus === 'done' && status === 'pending');

    return {
      id: `${id}-${next}`,
      source: id,
      target: next,
      animated: status === 'active' || isActive,
      style: {
        stroke: status === 'done' ? '#10b981' : isActive ? '#38bdf8' : '#27272a',
        strokeWidth: isActive ? 2.5 : 1.5,
        transition: 'stroke 0.4s ease, stroke-width 0.4s ease',
      },
    };
  });

  return (
    <div className="h-[285px] overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/35 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl hover:border-zinc-700/40 transition-colors duration-300 relative">
      {/* Header Info */}
      <div className="border-b border-zinc-800/60 px-4 py-3 bg-zinc-950/20 backdrop-blur-sm z-10 relative">
        <h3 className="text-sm font-semibold text-zinc-100">LangGraph Execution View</h3>
        <p className="text-[10px] text-zinc-500">React Flow pipeline driven by backend socket events</p>
      </div>
      
      {/* React Flow Render Workspace */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.45}
        maxZoom={1.2}
        panOnDrag={false}
        zoomOnScroll={false}
        nodesDraggable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="hsl(var(--border))" gap={18} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
