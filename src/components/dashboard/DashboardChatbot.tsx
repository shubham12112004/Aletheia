import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, X, Trash2, Copy, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ChatMessage } from '@/lib/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface DashboardChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onAsk: (text: string) => void;
  onClear?: () => void;
}

const SUGGESTED_QUESTIONS = [
  "What is the company's competitive moat?",
  "Are there any regulatory risks?",
  "Summarize the recent earnings call.",
];

export function DashboardChatbot({ isOpen, onClose, messages, onAsk, onClear }: DashboardChatbotProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    onAsk(input.trim());
    setInput('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Optionally add a toast here
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-24 right-6 z-50 flex h-[600px] w-[350px] flex-col overflow-hidden rounded-[24px] border border-border/50 bg-card/70 shadow-2xl shadow-black/20 backdrop-blur-3xl sm:w-[450px]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/40 bg-background/50 px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">AI Research Analyst</h3>
                <p className="text-[10px] text-emerald-500 font-medium">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && onClear && (
                <button
                  onClick={onClear}
                  className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                  title="Clear Chat"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border">
            <div className="flex flex-col gap-5">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center mt-10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mb-4 ring-4 ring-emerald-500/5">
                    <Bot className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Ask me anything about your research context.</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-8">I can analyze financials, sentiment, and risks.</p>
                  
                  <div className="flex flex-col gap-2 w-full max-w-[280px]">
                    {SUGGESTED_QUESTIONS.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => onAsk(q)}
                        className="rounded-xl border border-border/60 bg-muted/30 px-4 py-2.5 text-[13px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-left"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${
                      msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                        msg.role === 'user' ? 'bg-muted' : 'bg-primary/20 text-primary'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <User className="h-3 w-3 text-muted-foreground" />
                      ) : (
                        <Bot className="h-3 w-3" />
                      )}
                    </div>
                    <div className="flex flex-col gap-1 max-w-[85%]">
                      <div
                        className={`px-4 py-3 text-[14px] leading-relaxed shadow-sm ${
                          msg.role === 'user'
                            ? 'rounded-[20px] rounded-br-sm bg-primary text-primary-foreground'
                            : 'rounded-[20px] rounded-bl-sm border border-border/50 bg-background text-foreground'
                        }`}
                      >
                        {msg.role === 'user' ? (
                          msg.text
                        ) : (
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {msg.text}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                      
                      {/* Action buttons for Agent messages */}
                      {msg.role === 'agent' && (
                        <div className="flex items-center gap-2 mt-1 ml-2">
                          <button 
                            onClick={() => copyToClipboard(msg.text)}
                            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                          >
                            <Copy className="h-3 w-3" /> Copy
                          </button>
                          {i === messages.length - 1 && (
                            <button 
                              onClick={() => {
                                // Simple regenerate simulation
                                const lastUserMsg = messages.slice().reverse().find(m => m.role === 'user');
                                if (lastUserMsg) onAsk(lastUserMsg.text);
                              }}
                              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                            >
                              <RefreshCcw className="h-3 w-3" /> Regenerate
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
              {/* Fake loading state if user message is the last one */}
              {messages.length > 0 && messages[messages.length - 1].role === 'user' && (
                <div className="flex items-end gap-2">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <Bot className="h-3 w-3" />
                  </div>
                  <div className="flex max-w-[80%] items-center gap-1 rounded-[20px] rounded-bl-sm border border-border/50 bg-background px-4 py-3 text-sm text-foreground shadow-sm">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-emerald-500" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-border/40 bg-background/50 p-4">
            <form onSubmit={handleSubmit} className="relative flex items-center">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message AI Analyst..."
                className="h-12 w-full rounded-2xl border border-border/60 bg-background pl-4 pr-12 shadow-sm transition-all focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/20"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim()}
                className="absolute right-1.5 h-9 w-9 rounded-xl bg-emerald-500 text-white transition-all hover:bg-emerald-600 hover:shadow-md active:scale-[0.95] disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
