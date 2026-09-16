import { useEffect, useRef, useState, memo } from 'react';
import { MessageSquare, Send, Sparkles, User, BrainCircuit } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ChatMessage, MacroScenario, TimelineEntry, ResearchPhase } from '@/lib/types';

type Props = {
  messages: ChatMessage[];
  onAsk: (text: string, scenario: MacroScenario) => void;
  scenario: MacroScenario;
  hasResult: boolean;
  running: boolean;
  timeline: TimelineEntry[];
  thinking: string[];
  phase: ResearchPhase;
};

const SUGGESTED = [
  'Why is regulatory risk flagged as high?',
  'How does the macro scenario affect the verdict?',
  'Explain the confidence score breakdown.',
  'What does the insider trading data show?',
];

export const InterrogatePanel = memo(function InterrogatePanel({
  messages,
  onAsk,
  scenario,
  hasResult,
  running,
  timeline,
  thinking,
  phase,
}: Props) {
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || !hasResult || running) return;
    onAsk(trimmed, scenario);
    setDraft('');
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-zinc-800/50 bg-zinc-900/35 shadow-[0_8px_32px_0_rgba(0,0,0,0.35)] backdrop-blur-xl hover:border-zinc-700/40 transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
            <MessageSquare className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-zinc-100">
              Interrogate the Agent
            </h3>
            <p className="text-[10px] text-zinc-500">
              Ask about the generated report
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[9px] font-semibold tracking-wider bg-primary/10 text-primary border-primary/20 uppercase">
          <Sparkles className="h-2.5 w-2.5" />
          {phase === 'idle' ? 'live' : phase.replace(/-/g, ' ')}
        </span>
      </div>

      {/* Messages & Streams */}
      <div
        ref={scrollRef}
        className="stream-scroll flex-1 space-y-3.5 overflow-y-auto px-3.5 py-4 scrollbar-thin"
      >
        {/* Live thinking log widget */}
        <div className="rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-3 shadow-inner">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              Live thinking
            </p>
            <span className="rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-[9px] font-medium text-primary">
              {running ? 'streaming' : hasResult ? 'complete' : 'idle'}
            </span>
          </div>
          <div className="space-y-1.5">
            {(thinking.length ? thinking.slice(-3) : ['Waiting for a research pass to start']).map((line, index) => (
              <motion.div
                key={`${line}-${index}`}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: index * 0.04 }}
                className="flex items-center gap-2 rounded-lg border border-zinc-900 bg-zinc-950/50 px-2.5 py-1.5"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <p className="text-[11px] text-zinc-300 font-medium">{line}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Live Timeline logs widget */}
        <div className="rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-3 shadow-inner">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              Research timeline
            </p>
            <span className="font-mono text-[9px] text-zinc-500">{timeline.length} events</span>
          </div>
          <div className="space-y-1.5">
            {(timeline.length ? timeline.slice(-3) : [{ id: 0, label: 'Financial API called', detail: 'Timeline will appear here', timestamp: '--:--:--', state: 'pending' as const }]).map((entry) => (
              <div key={entry.id} className="flex items-start gap-2.5 rounded-lg border border-zinc-900 bg-zinc-950/50 px-2.5 py-1.5">
                <span
                  className={cn(
                    'mt-1 h-1.5 w-1.5 shrink-0 rounded-full',
                    entry.state === 'live' ? 'bg-primary animate-pulse' : entry.state === 'done' ? 'bg-emerald-500' : 'bg-zinc-700'
                  )}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[11px] font-bold text-zinc-200">{entry.label}</p>
                    <span className="font-mono text-[9px] text-zinc-500">{entry.timestamp}</span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-zinc-400 leading-normal">{entry.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        {messages.length === 0 ? (
          <div className="flex h-[200px] flex-col items-center justify-center text-center p-4">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/5">
              <BrainCircuit className="h-5 w-5 text-primary animate-pulse" />
            </div>
            <p className="text-xs font-semibold text-zinc-200">
              {hasResult ? 'Ready when you are.' : 'Run a research pass first.'}
            </p>
            <p className="mt-1 max-w-[200px] text-[10px] text-zinc-500 leading-normal">
              {hasResult
                ? 'Ask about the verdict, metrics, macro assumptions, or cited evidence.'
                : 'The agent will be available to answer questions once a report is generated.'}
            </p>
            {hasResult && (
              <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                {SUGGESTED.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full border border-zinc-800 bg-zinc-950/40 px-2.5 py-1 text-[10px] text-zinc-400 transition-all hover:border-primary/40 hover:text-primary hover:bg-primary/5 hover:translate-y-[-1px]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className={cn(
                  'flex items-start gap-2.5',
                  m.role === 'user' && 'flex-row-reverse'
                )}
              >
                <div
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border',
                    m.role === 'user'
                      ? 'border-zinc-800 bg-zinc-900 text-zinc-400'
                      : 'border-primary/30 bg-primary/10 text-primary'
                  )}
                >
                  {m.role === 'user' ? <User className="h-3.5 w-3.5" /> : <BrainCircuit className="h-3.5 w-3.5" />}
                </div>
                <div
                  className={cn(
                    'max-w-[80%] rounded-xl border px-3 py-2 shadow-sm',
                    m.role === 'user'
                      ? 'border-primary/30 bg-primary/15 text-zinc-100'
                      : 'border-zinc-800 bg-zinc-950/50 text-zinc-300'
                  )}
                >
                  <p className="text-xs leading-relaxed font-sans">{m.text}</p>
                  <p className="mt-1 text-right font-mono text-[8px] text-zinc-600">
                    {m.timestamp}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {running && (
          <div className="flex items-start gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
              <BrainCircuit className="h-3.5 w-3.5 animate-spin" />
            </div>
            <div className="rounded-xl border border-zinc-850 bg-zinc-950/50 px-3 py-2 text-xs text-zinc-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                Thinking...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input panel */}
      <div className="border-t border-zinc-800/60 p-3 bg-zinc-950/20">
        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send(draft)}
            placeholder={
              hasResult ? 'Ask the agent a question...' : 'Run research to enable chat...'
            }
            disabled={!hasResult || running}
            className="h-10 rounded-lg border-zinc-800 bg-zinc-950/60 text-sm shadow-inner focus-visible:ring-primary/40 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-primary/50"
            aria-label="Question for the agent"
          />
          <Button
            onClick={() => send(draft)}
            disabled={!draft.trim() || !hasResult || running}
            size="icon"
            className="h-10 w-10 shrink-0 rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:brightness-110 disabled:opacity-50 disabled:pointer-events-none"
            aria-label="Send question"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
});
