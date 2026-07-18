import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Clock3, Search, TrendingUp, TrendingDown,
  Sparkles, Plus, History, BookMarked, LogOut, Activity, PieChart, Wallet, 
  ArrowUpRight, Briefcase, FileText, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useResearchAgent } from '@/hooks/useResearchAgent';
import { MACRO_SCENARIOS } from '@/lib/mockData';
import type { FocusFilters, MacroScenario, ResearchResult } from '@/lib/types';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { ProcessingPipeline } from '@/components/dashboard/ProcessingPipeline';
import { RecommendationBadge } from '@/components/dashboard/RecommendationBadge';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { MarkdownReport } from '@/components/dashboard/MarkdownReport';
import { OnboardingModal } from '@/components/dashboard/OnboardingModal';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { cn } from '@/lib/utils';
import { getWatchlist, addToWatchlist, removeFromWatchlist } from '@/lib/api';
import { DashboardChatbot } from './dashboard/DashboardChatbot';

type NotificationItem = {
  id: string; title: string; desc: string; type: 'info' | 'success' | 'warn'; time: string;
};
type ResearchSnapshot = {
  id: string; company: string; ticker: string; createdAt: string;
  result: ResearchResult; rawMarkdown: string; timelineCount: number;
  profile: any; quote: any; financials: any; newsData: any[];
};

const STORAGE_KEY = 'aletheia.researchHistory';

// Mock Data for Premium Layout
const MOCK_PORTFOLIO = {
  value: 124592.45,
  dailyChange: 1240.50,
  dailyPercent: 1.01,
  sentiment: 'Bullish',
  status: 'Open - NASDAQ',
  allocations: [
    { label: 'Technology', val: 45, color: 'bg-blue-500' },
    { label: 'Healthcare', val: 25, color: 'bg-emerald-500' },
    { label: 'Finance', val: 20, color: 'bg-purple-500' },
    { label: 'Energy', val: 10, color: 'bg-amber-500' }
  ],
  transactions: [
    { id: 1, type: 'BUY', ticker: 'NVDA', shares: 15, price: 120.45, date: 'Today, 09:30 AM' },
    { id: 2, type: 'SELL', ticker: 'TSLA', shares: 50, price: 175.20, date: 'Yesterday, 14:15 PM' },
    { id: 3, type: 'BUY', ticker: 'MSFT', shares: 25, price: 415.80, date: 'Oct 24, 11:05 AM' }
  ]
};

const MOCK_TRENDING = [
  { ticker: 'NVDA', price: 125.40, change: '+4.2%' },
  { ticker: 'TSLA', price: 178.20, change: '-1.5%' },
  { ticker: 'PLTR', price: 24.50, change: '+8.4%' },
  { ticker: 'SMCI', price: 890.10, change: '-4.2%' },
];

const RECOMMENDATIONS = [
  { ticker: 'AAPL', name: 'Apple Inc.' },
  { ticker: 'MSFT', name: 'Microsoft Corporation' },
  { ticker: 'NVDA', name: 'NVIDIA Corporation' },
  { ticker: 'TSLA', name: 'Tesla, Inc.' },
  { ticker: 'AMZN', name: 'Amazon.com, Inc.' }
];

function buildLiveSnapshot(data: any): ResearchSnapshot {
  return {
    id: Math.random().toString(36).substr(2, 9),
    company: data.profile?.name || data.result?.company || 'Unknown',
    ticker: data.profile?.ticker || data.result?.ticker || 'N/A',
    createdAt: new Date().toISOString(),
    result: data.result,
    rawMarkdown: data.rawMarkdown,
    timelineCount: data.timeline?.length || 0,
    profile: data.profile,
    quote: data.quote,
    financials: data.financials,
    newsData: data.news
  };
}

export function DashboardView() {
  const { user, token, logout } = useAuth();
  const { status, phase, steps, result, rawMarkdown, progress, messages, timeline, profile, quote, financials, news, run, reset, ask, clearChat, error } = useResearchAgent();
  
  const [company, setCompany] = useState('');
  const [scenario] = useState<MacroScenario>(MACRO_SCENARIOS[2]);
  const [focus] = useState<FocusFilters>({ regulatory: true, insider: false });
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [history, setHistory] = useState<ResearchSnapshot[]>([]);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [watchlistItems, setWatchlistItems] = useState<Array<{ ticker: string; name: string }>>([]);

  const addNotification = (title: string, desc: string, type: 'info' | 'success' | 'warn' = 'info') => {
    const item: NotificationItem = { id: Math.random().toString(), title, desc, type, time: new Date().toLocaleTimeString() };
    setNotifications((prev) => [item, ...prev].slice(0, 20));
  };

  const syncWatchlist = async (silent = false) => {
    try {
      const items = await getWatchlist(token);
      setWatchlistItems(items);
      if (!silent) addNotification('Watchlist Synced', 'Your watchlist has been updated.', 'success');
    } catch (err) {
      if (!silent) addNotification('Sync Failed', 'Could not sync watchlist.', 'warn');
    }
  };

  useEffect(() => {
    document.documentElement.classList.add('dark'); // Force dark mode for premium feel
    if (token && user) {
      syncWatchlist(true);
      addNotification('Terminal Online', `Logged in as ${user.email}`, 'info');
    }
  }, [token]); // eslint-disable-line

  useEffect(() => { try { const stored = localStorage.getItem(STORAGE_KEY); if (stored) setHistory(JSON.parse(stored)); } catch { setHistory([]); } }, []);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 20))); } catch (e) { /* ignore */ } }, [history]);

  const running = status === 'running';
  const hasResult = status === 'complete' && Boolean(result);
  const activeDataset = (history.find((item) => item.id === selectedSnapshotId)) || (result ? buildLiveSnapshot({ result, rawMarkdown, timeline, profile, quote, financials, news }) : null);

  useEffect(() => { if (running) addNotification('Research Initiated', `Querying agent swarm for ${company.toUpperCase()}`, 'info'); }, [running]); // eslint-disable-line

  useEffect(() => {
    if (!hasResult || !result) return;
    const snapshot = buildLiveSnapshot({ result, rawMarkdown, timeline, profile, quote, financials, news });
    setHistory((current) => [snapshot, ...current.filter((item) => item.ticker !== snapshot.ticker || item.rawMarkdown !== snapshot.rawMarkdown)].slice(0, 20));
    setSelectedSnapshotId(null);
    addNotification('Analysis Complete', `Agent generated verdict: ${result.verdict}`, 'success');
  }, [hasResult, result, rawMarkdown, timeline, profile, quote, financials, news]); // eslint-disable-line

  useEffect(() => {
    const handleOpenChat = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setIsChatOpen(true);
      if (customEvent.detail) setTimeout(() => ask(customEvent.detail, scenario), 300);
    };
    window.addEventListener('open-chat-with-query', handleOpenChat);
    return () => window.removeEventListener('open-chat-with-query', handleOpenChat);
  }, [ask, scenario]);

  const handleSearch = (targetOverride?: unknown) => {
    const target = typeof targetOverride === 'string' ? targetOverride.trim() : company.trim();
    if (!target || running) return;
    setSelectedSnapshotId(null); setCompany(target);
    run(target, scenario, focus.regulatory, focus.insider);
  };
  
  const handleNewResearch = () => { reset(); setSelectedSnapshotId(null); setCompany(''); };

  const handleAddToWatchlist = async (ticker: string, name: string) => {
    try {
      await addToWatchlist({ ticker, name }, token);
      await syncWatchlist(true);
      addNotification('Watchlist Updated', `Added ${ticker.toUpperCase()}`, 'success');
    } catch (err) {
      addNotification('Watchlist Error', err instanceof Error ? err.message : 'Failed to add', 'warn');
    }
  };



  const initials = (user?.name || 'AI').split(' ').map((item) => item[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="min-h-screen bg-[#09090b] text-foreground flex flex-col font-sans selection:bg-emerald-500/30">
      
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      {/* SECTION 1: TOP NAVIGATION */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full px-4 sm:px-6 lg:px-8 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 cursor-pointer" onClick={handleNewResearch}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-bold shadow-md">
                A
              </div>
              <span className="font-bold tracking-tight text-lg hidden sm:block text-zinc-100">Aletheia</span>
            </div>
            <div className="hidden lg:flex items-center gap-6 ml-6 text-sm font-medium text-zinc-400">
              <span className="text-zinc-100 cursor-pointer transition-colors">Terminal</span>
              <span className="hover:text-zinc-100 cursor-pointer transition-colors">Markets</span>
              <span className="hover:text-zinc-100 cursor-pointer transition-colors">Screener</span>
              <span className="hover:text-zinc-100 cursor-pointer transition-colors">Portfolios</span>
            </div>
          </div>
          
          <div className="flex-1 flex justify-center max-w-xl mx-4">
            <div className="relative w-full max-w-md group hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
              <Input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search symbol, company, or sector..."
                className="w-full bg-zinc-900/50 border-border/50 pl-10 pr-4 h-9 rounded-full focus-visible:ring-1 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50 transition-all placeholder:text-zinc-600 text-sm shadow-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setIsChatOpen(!isChatOpen)} className={cn("h-8 w-8 rounded-full", isChatOpen && "bg-emerald-500/10 text-emerald-500")}>
              <Sparkles className="h-4 w-4" />
            </Button>
            <div className="relative">
              <Button variant="ghost" size="icon" onClick={() => setNotificationsOpen(!notificationsOpen)} className="h-8 w-8 rounded-full">
                <Bell className="h-4 w-4" />
                {notifications.length > 0 && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />}
              </Button>
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-border/50 bg-[#09090b]/95 backdrop-blur-xl p-2 shadow-2xl z-50">
                    <div className="p-2 pb-3 mb-2 border-b border-border/50"><h3 className="text-sm font-bold text-zinc-100">Terminal Events</h3></div>
                    <div className="max-h-[300px] overflow-y-auto space-y-1">
                      {notifications.length === 0 ? <p className="p-4 text-center text-xs text-zinc-500">No events</p> : notifications.map((n) => (
                        <div key={n.id} className="rounded-xl p-3 hover:bg-zinc-800/50 transition">
                          <div className="flex justify-between items-start"><p className="text-sm font-semibold text-zinc-200">{n.title}</p><span className="text-[10px] text-zinc-500">{n.time}</span></div>
                          <p className="text-xs text-zinc-400 mt-1">{n.desc}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="relative ml-1">
              <button onClick={() => setProfileMenuOpen(!profileMenuOpen)} className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 text-xs font-bold text-white shadow-md ring-1 ring-border/50 hover:ring-zinc-500 transition-all">
                {initials}
              </button>
              <AnimatePresence>
                {profileMenuOpen && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-border/50 bg-[#09090b]/95 backdrop-blur-xl p-2 shadow-2xl z-50">
                    <div className="px-3 py-3 border-b border-border/50 mb-2">
                      <p className="text-sm font-bold text-zinc-100 truncate">{user?.name || 'Analyst'}</p>
                      <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                      <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                        <Activity className="h-3 w-3" /> Active Workspace
                      </div>
                    </div>
                    <div className="space-y-1 mb-2">
                      <button onClick={() => { setIsSettingsOpen(true); setProfileMenuOpen(false); }} className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-white transition">
                        <Settings className="h-4 w-4 text-zinc-400" /> Settings & Preferences
                      </button>
                    </div>
                    <button onClick={logout} className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 transition">
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 relative z-10">
        
        {/* SECTION 2: PREMIUM METRIC CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <DashboardCard className="p-5 flex flex-col justify-between bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors border-border/40 shadow-sm">
            <div className="flex items-center justify-between text-zinc-400 mb-4"><span className="text-xs font-bold uppercase tracking-wider">Portfolio Value</span><Wallet className="h-4 w-4" /></div>
            <div>
              <div className="text-2xl font-black text-zinc-100">${MOCK_PORTFOLIO.value.toLocaleString()}</div>
              <div className="flex items-center gap-1 text-xs mt-1 text-emerald-500 font-bold">
                <ArrowUpRight className="h-3 w-3 stroke-[3]" />
                <span>+${MOCK_PORTFOLIO.dailyChange.toLocaleString()} ({MOCK_PORTFOLIO.dailyPercent}%)</span>
              </div>
            </div>
          </DashboardCard>
          
          <DashboardCard className="p-5 flex flex-col justify-between bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors border-border/40 shadow-sm">
            <div className="flex items-center justify-between text-zinc-400 mb-4"><span className="text-xs font-bold uppercase tracking-wider">Market Sentiment</span><Activity className="h-4 w-4" /></div>
            <div>
              <div className="text-2xl font-black text-emerald-500">{MOCK_PORTFOLIO.sentiment}</div>
              <div className="text-xs mt-1 text-zinc-500 font-semibold">Based on 142 AI signals</div>
            </div>
          </DashboardCard>
          
          <DashboardCard className="p-5 flex flex-col justify-between bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors border-border/40 shadow-sm">
            <div className="flex items-center justify-between text-zinc-400 mb-4"><span className="text-xs font-bold uppercase tracking-wider">AI Confidence Score</span><Sparkles className="h-4 w-4" /></div>
            <div>
              <div className="text-2xl font-black text-zinc-100">{activeDataset?.result?.confidence ? `${activeDataset.result.confidence}%` : '--'}</div>
              <div className="text-xs mt-1 text-zinc-500 font-semibold">For {activeDataset?.ticker || 'current context'}</div>
            </div>
          </DashboardCard>

          <DashboardCard className="p-5 flex flex-col justify-between bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors border-border/40 shadow-sm">
            <div className="flex items-center justify-between text-zinc-400 mb-4"><span className="text-xs font-bold uppercase tracking-wider">Active Watchlist</span><BookMarked className="h-4 w-4" /></div>
            <div>
              <div className="text-2xl font-black text-zinc-100">{watchlistItems.length}</div>
              <div className="text-xs mt-1 text-zinc-500 font-semibold">Assets tracked</div>
            </div>
          </DashboardCard>

          <DashboardCard className="p-5 flex flex-col justify-between bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors border-border/40 shadow-sm">
            <div className="flex items-center justify-between text-zinc-400 mb-4"><span className="text-xs font-bold uppercase tracking-wider">Market Status</span><Clock3 className="h-4 w-4" /></div>
            <div>
              <div className="text-2xl font-black text-emerald-500">Open</div>
              <div className="text-xs mt-1 text-zinc-500 font-semibold">NASDAQ / NYSE</div>
            </div>
          </DashboardCard>
        </div>

        {/* Dynamic Centerpiece Area */}
        <div className="flex flex-col flex-1 gap-6">
          {running ? (
            <DashboardCard className="py-16 flex items-center justify-center min-h-[500px] border-border/40 bg-zinc-900/20">
               <ProcessingPipeline steps={steps as any} progress={progress} phase={phase} />
            </DashboardCard>
          ) : error ? (
            <DashboardCard className="border-red-500/20 bg-red-500/5 min-h-[500px] flex items-center justify-center">
              <div className="flex flex-col items-center text-center max-w-md p-8">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 shadow-inner"><TrendingDown className="h-8 w-8" /></div>
                <h3 className="mb-3 text-2xl font-black text-zinc-100">Analysis Interrupted</h3>
                <p className="mb-8 text-sm text-zinc-400 leading-relaxed">{error}</p>
                <Button onClick={handleNewResearch} className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 font-bold px-8">Acknowledge & Reset</Button>
              </div>
            </DashboardCard>
          ) : activeDataset ? (
            /* SECTION 3: AI RESEARCH PANEL CENTERPIECE */
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid lg:grid-cols-[1fr_400px] gap-6">
              <div className="space-y-6">
                <DashboardCard className="p-6 lg:p-8 border-border/40 shadow-md">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div className="flex items-center gap-5">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-emerald-500/20">
                        {activeDataset.ticker.slice(0, 2)}
                      </div>
                      <div>
                        <h2 className="text-3xl font-black tracking-tight text-zinc-100">{activeDataset.company}</h2>
                        <div className="flex items-center gap-3 text-sm text-zinc-500 mt-1 font-medium">
                          <span className="font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">{activeDataset.ticker}</span>
                          <span>•</span>
                          <span>{activeDataset.profile?.finnhubIndustry || 'Technology'}</span>
                          <span>•</span>
                          <span>{activeDataset.profile?.country || 'US'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <RecommendationBadge verdict={activeDataset.result.verdict} />
                      <button onClick={() => handleAddToWatchlist(activeDataset.ticker, activeDataset.company)} className="text-xs font-bold text-zinc-400 hover:text-emerald-400 flex items-center gap-1.5 transition-colors group">
                        <Plus className="h-3.5 w-3.5 group-hover:bg-emerald-500/20 rounded-full" /> Add to Watchlist
                      </button>
                    </div>
                  </div>
                  
                  {/* Valuation / Financial Metrics Mini Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-5 rounded-2xl bg-[#09090b] border border-border/40 shadow-inner">
                     {activeDataset.result.metrics?.slice(0,4).map(m => (
                       <div key={m.label}>
                         <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">{m.label}</div>
                         <div className="text-xl font-black text-zinc-200">{m.value}</div>
                       </div>
                     ))}
                  </div>

                  <DashboardCharts result={activeDataset.result} />
                </DashboardCard>
                
                {/* Markdown Report Render */}
                <DashboardCard className="p-6 lg:p-8 border-border/40 shadow-md">
                  <h3 className="text-xl font-black mb-6 flex items-center gap-2 border-b border-border/40 pb-4 text-zinc-100">
                    <FileText className="h-6 w-6 text-emerald-500" /> AI Evaluation Report
                  </h3>
                  <MarkdownReport markdown={activeDataset.rawMarkdown} />
                  
                  {/* Smart Follow-ups */}
                  {activeDataset.result.suggestedQuestions && activeDataset.result.suggestedQuestions.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-border/40">
                      <h4 className="text-sm font-bold mb-4 uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" /> Smart Follow-ups
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {activeDataset.result.suggestedQuestions.map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              const event = new CustomEvent('open-chat-with-query', { detail: q });
                              window.dispatchEvent(event);
                            }}
                            className="rounded-full bg-zinc-900 border border-border/60 px-4 py-2 text-sm font-medium text-zinc-300 hover:border-emerald-500/50 hover:text-emerald-400 transition-all text-left shadow-sm hover:shadow-md"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </DashboardCard>
              </div>

              {/* Right Panel: AI Quick Insights & News */}
              <div className="space-y-6">
                <DashboardCard className="p-6 bg-gradient-to-b from-emerald-500/10 to-transparent border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-4 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" /> Agent Recommendation
                  </h3>
                  <div className="text-4xl font-black mb-1 text-zinc-100 tracking-tight">{activeDataset.result.verdict}</div>
                  <div className="text-sm text-zinc-400 mb-6 font-medium">{activeDataset.result.confidence}% Algorithm Confidence</div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="p-4 rounded-xl bg-background/50 border border-border/40 shadow-sm">
                      <div className="text-xs font-black text-emerald-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5 stroke-[3]" /> Primary Bull Signal</div>
                      <div className="text-sm font-semibold text-zinc-300 leading-snug">{activeDataset.result.pros?.[0]?.text || 'Strong fundamentals detected across sector'}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-background/50 border border-border/40 shadow-sm">
                      <div className="text-xs font-black text-rose-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><TrendingDown className="h-3.5 w-3.5 stroke-[3]" /> Primary Bear Risk</div>
                      <div className="text-sm font-semibold text-zinc-300 leading-snug">{activeDataset.result.cons?.[0]?.text || 'Macroeconomic headwinds indicate volatility'}</div>
                    </div>
                  </div>
                  
                  <Button onClick={() => setIsChatOpen(true)} className="w-full bg-emerald-500 text-white hover:bg-emerald-600 font-bold h-11 rounded-xl shadow-md shadow-emerald-500/20 transition-all active:scale-[0.98]">
                    Interrogate Research Agent
                  </Button>
                </DashboardCard>

                {/* Live News */}
                <DashboardCard className="p-6 border-border/40 shadow-sm">
                  <h3 className="text-sm font-bold uppercase tracking-widest mb-4 border-b border-border/40 pb-3 text-zinc-500">Live Intel</h3>
                  <div className="space-y-5">
                    {activeDataset.newsData?.slice(0,5).map((n, i) => (
                      <a key={i} href={n.url || '#'} target="_blank" rel="noreferrer" className="block group">
                        <div className="flex justify-between items-start mb-1">
                          <div className="text-xs text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded uppercase">{n.source?.name || 'Bloomberg'}</div>
                        </div>
                        <div className="text-sm font-semibold text-zinc-300 group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">{n.title}</div>
                      </a>
                    ))}
                  </div>
                </DashboardCard>
              </div>
            </motion.div>
          ) : (
            /* SECTION 4: IDLE MARKET OVERVIEW & PORTFOLIO */
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid lg:grid-cols-[1fr_380px] gap-6">
              
              <div className="space-y-6">
                {/* Hero Search in Idle State */}
                <DashboardCard className="p-10 lg:p-16 flex flex-col items-center justify-center min-h-[350px] bg-zinc-900/30 border-border/40 text-center relative overflow-hidden shadow-inner">
                  <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>
                  
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-xl shadow-emerald-500/20 mb-6">
                    <Search className="h-8 w-8 stroke-[2.5]" />
                  </div>
                  <h2 className="text-4xl lg:text-5xl font-black tracking-tight mb-3 text-zinc-100">Global Market Intelligence</h2>
                  <p className="text-zinc-400 mb-10 max-w-xl font-medium">Enter a stock ticker, company name, or ETF to generate an institutional-grade investment research report powered by AI agents.</p>
                  
                  <div className="relative w-full max-w-2xl group mx-auto mb-6">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                    <Input
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="e.g. AAPL, Tesla, NVDA..."
                      className="w-full bg-[#09090b] border-border/60 pl-14 pr-32 h-16 rounded-2xl text-lg shadow-xl focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50 transition-all placeholder:text-zinc-600 font-semibold"
                    />
                    <Button
                      onClick={() => handleSearch()}
                      disabled={!company.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-12 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 font-bold px-8 shadow-md"
                    >
                      Analyze
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Trending:</span>
                    <div className="flex flex-wrap justify-center gap-2">
                      {RECOMMENDATIONS.map(r => (
                        <button key={r.ticker} onClick={() => handleSearch(r.ticker)} className="text-xs font-bold px-4 py-1.5 rounded-full bg-zinc-900 hover:bg-emerald-500/20 hover:border-emerald-500/50 hover:text-emerald-400 transition-all border border-border/40 text-zinc-400">
                          {r.ticker}
                        </button>
                      ))}
                    </div>
                  </div>
                </DashboardCard>

                {/* Trending Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {MOCK_TRENDING.map(t => (
                    <DashboardCard key={t.ticker} className="p-5 bg-zinc-900/40 hover:bg-zinc-800/60 border-border/40 transition-colors cursor-pointer group shadow-sm" onClick={() => handleSearch(t.ticker)}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="font-black text-xl text-zinc-200 group-hover:text-emerald-400 transition-colors">{t.ticker}</div>
                        <div className={`text-xs font-black px-2 py-1 rounded-md ${t.change.startsWith('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                          {t.change}
                        </div>
                      </div>
                      <div className="text-base font-bold text-zinc-400">${t.price.toFixed(2)}</div>
                    </DashboardCard>
                  ))}
                </div>

                {/* Recent Research History Grid */}
                {history.length > 0 && (
                  <DashboardCard className="p-6 border-border/40 shadow-sm bg-zinc-900/20">
                    <div className="flex items-center justify-between mb-5 border-b border-border/40 pb-4">
                      <h3 className="font-black text-zinc-100 flex items-center gap-2"><History className="h-5 w-5 text-emerald-500" /> Recent AI Reports</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {history.slice(0,4).map(item => (
                        <div key={item.id} onClick={() => setSelectedSnapshotId(item.id)} className="p-4 rounded-xl border border-border/40 bg-[#09090b] hover:border-emerald-500/30 transition-all cursor-pointer flex justify-between items-center group shadow-sm">
                          <div>
                            <div className="font-black text-zinc-200 mb-1 group-hover:text-emerald-400 transition-colors truncate max-w-[150px] sm:max-w-full">{item.company}</div>
                            <div className="text-xs text-zinc-500 font-medium flex items-center gap-2">
                              <span className="font-bold text-zinc-400">{item.ticker}</span>
                              <span>•</span>
                              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <RecommendationBadge verdict={item.result.verdict} />
                        </div>
                      ))}
                    </div>
                  </DashboardCard>
                )}
              </div>

              {/* Right Panel: Mock Portfolio Details */}
              <div className="space-y-6">
                <DashboardCard className="p-6 border-border/40 shadow-sm bg-zinc-900/20">
                  <h3 className="font-black mb-5 text-zinc-100 border-b border-border/40 pb-3 flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-emerald-500" /> Portfolio Allocation
                  </h3>
                  <div className="space-y-4">
                    {MOCK_PORTFOLIO.allocations.map(a => (
                      <div key={a.label}>
                        <div className="flex justify-between text-sm mb-1.5 font-bold">
                          <span className="text-zinc-300">{a.label}</span>
                          <span className="text-zinc-500">{a.val}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-[#09090b] rounded-full overflow-hidden shadow-inner border border-border/30">
                          <div className={`h-full ${a.color} rounded-full`} style={{ width: `${a.val}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </DashboardCard>

                <DashboardCard className="p-6 border-border/40 shadow-sm bg-zinc-900/20">
                  <h3 className="font-black mb-5 text-zinc-100 border-b border-border/40 pb-3 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-emerald-500" /> Recent Transactions
                  </h3>
                  <div className="space-y-3">
                    {MOCK_PORTFOLIO.transactions.map(tx => (
                      <div key={tx.id} className="flex justify-between items-center p-3.5 rounded-xl border border-border/40 bg-[#09090b] hover:bg-zinc-800/40 transition">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${tx.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>{tx.type}</span>
                            <span className="font-black text-zinc-200">{tx.ticker}</span>
                          </div>
                          <div className="text-xs text-zinc-500 font-medium">{tx.date}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-sm text-zinc-200">${tx.price.toFixed(2)}</div>
                          <div className="text-xs text-zinc-500 font-medium">{tx.shares} shares</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </DashboardCard>
              </div>

            </motion.div>
          )}
        </div>
      </main>

      {/* Global Chatbot */}
      <DashboardChatbot 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        messages={messages} 
        onAsk={(text) => ask(text, scenario)}
        onClear={clearChat}
      />
      
      {/* First-Time Onboarding Modal */}
      <OnboardingModal />
      
      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
