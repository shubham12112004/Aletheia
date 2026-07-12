import { useEffect, useRef, memo } from 'react';
import { Terminal, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  logs: { id: number; timestamp: string; message: string }[];
  running: boolean;
};

export const LiveLogsPanel = memo(function LiveLogsPanel({ logs, running }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal container to the bottom as new logs arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="rounded-2xl border border-zinc-800/50 bg-zinc-900/35 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl hover:border-zinc-700/40 transition-colors duration-300 flex flex-col h-[280px]">
      {/* Terminal Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
            <Terminal className="h-3.5 w-3.5 text-zinc-400" />
          </div>
          <div>
            <h3 className="text-xs font-semibold tracking-tight text-zinc-100">
              Live Execution Logs
            </h3>
            <p className="text-[10px] text-muted-foreground">
              Real-time socket data stream
            </p>
          </div>
        </div>

        {/* Live Status indicator */}
        <span
          className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[9px] font-medium tracking-wide uppercase',
            running
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-zinc-800/40 text-zinc-500 border-zinc-700/20'
          )}
        >
          <Circle
            className={cn(
              'h-1.5 w-1.5 fill-current shrink-0',
              running ? 'text-emerald-400 animate-pulse' : 'text-zinc-600'
            )}
          />
          {running ? 'Live' : 'Offline'}
        </span>
      </div>

      {/* Terminal Screen */}
      <div
        ref={containerRef}
        className="flex-1 bg-zinc-950/90 rounded-xl p-3.5 overflow-y-auto scrollbar-thin border border-zinc-900/60 font-mono text-xs leading-relaxed"
      >
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-600 select-none">
            <p className="text-[10px] uppercase tracking-widest">Awaiting execution...</p>
            <p className="text-[9px] mt-1">Start research to stream live graph logs</p>
          </div>
        ) : (
          <div className="space-y-2 text-zinc-400">
            {logs.map((log) => (
              <div key={log.id} className="transition-all duration-200">
                {/* Format: Timestamp, Message, Hyphens Separator */}
                <div className="text-primary/70 font-semibold">{log.timestamp}</div>
                <div className="text-zinc-200 mt-0.5 font-medium">{log.message}</div>
                <div className="text-zinc-800 select-none mt-1">----------------</div>
              </div>
            ))}
            {running && (
              <div className="flex items-center gap-1.5 text-sky-400 text-[10px] animate-pulse py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-ping" />
                <span>Streaming live events...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
