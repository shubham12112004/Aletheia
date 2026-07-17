import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, ChevronDown, Clock3, Database, Globe2,
  PlayCircle, Search, Settings, SlidersHorizontal, TrendingUp, User, X,
  Sparkles, LayoutDashboard, History, BookMarked, Plus, Trash2, Info as InfoIcon,
  Camera, LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { useResearchAgent } from '@/hooks/useResearchAgent';
import { MACRO_SCENARIOS, getChatIntro } from '@/lib/mockData';
import type { FocusFilters, MacroScenario, ResearchResult } from '@/lib/types';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { ProcessingPipeline } from '@/components/dashboard/ProcessingPipeline';
import { RecommendationBadge } from '@/components/dashboard/RecommendationBadge';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { MarkdownReport } from '@/components/dashboard/MarkdownReport';
import { ResearchGraphView } from '@/components/ResearchGraph/ResearchGraphView';
import { cn } from '@/lib/utils';
import {
  getWatchlist, addToWatchlist, removeFromWatchlist,
  postUpdateProfile, postUpdatePassword, deleteAccount
} from '@/lib/api';

type ActiveTab = 'dashboard' | 'history' | 'watchlist' | 'profile' | 'settings';
type AnalysisDepth = 'fast' | 'deep';
type ApiEndpoint = 'production' | 'staging';
type NotificationItem = {
  id: string; title: string; desc: string; type: 'info' | 'success' | 'warn'; time: string;
};
type ResearchSnapshot = {
  id: string; company: string; ticker: string; createdAt: string;
  result: ResearchResult; rawMarkdown: string; timelineCount: number;
  profile: any; quote: any; financials: any; newsData: any[];
};

const STORAGE_KEY = 'aletheia.researchHistory';

// Fixed navbar: Profile removed as request (opens when profile clicked & as settings option)
const navItems: Array<{ id: ActiveTab; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'history', label: 'History', icon: History },
  { id: 'watchlist', label: 'Watchlist', icon: BookMarked },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const RECOMMENDATIONS = [
  { ticker: 'AAPL', name: 'Apple Inc.' },
  { ticker: 'MSFT', name: 'Microsoft Corporation' },
  { ticker: 'NVDA', name: 'NVIDIA Corporation' },
  { ticker: 'TSLA', name: 'Tesla, Inc.' },
  { ticker: 'AMZN', name: 'Amazon.com, Inc.' }
];

export function DashboardView() {
  const { user, token, logout, updateUser } = useAuth();
  const { status, phase, steps, result, rawMarkdown, progress, messages, timeline, profile, quote, financials, news, run, reset, ask } = useResearchAgent();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [company, setCompany] = useState('');
  const [scenario] = useState<MacroScenario>(MACRO_SCENARIOS[2]);
  const [focus] = useState<FocusFilters>({ regulatory: true, insider: false });
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [history, setHistory] = useState<ResearchSnapshot[]>([]);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null);
  const [apiEndpoint, setApiEndpoint] = useState<ApiEndpoint>('production');
  const [analysisDepth, setAnalysisDepth] = useState<AnalysisDepth>('deep');
  const [quotaAlerts, setQuotaAlerts] = useState(true);
  const [socketProgress, setSocketProgress] = useState(true);

  // Dynamic notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Watchlist State (Persisted in DB)
  const [watchlistItems, setWatchlistItems] = useState<Array<{ ticker: string; name: string }>>([]);
  const [watchlistError, setWatchlistError] = useState<string | null>(null);

  const addNotification = (title: string, desc: string, type: 'info' | 'success' | 'warn' = 'info') => {
    const item: NotificationItem = {
      id: Math.random().toString(),
      title,
      desc,
      type,
      time: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    };
    setNotifications((prev) => [item, ...prev].slice(0, 15));
    setUnreadNotifications((c) => c + 1);
  };

  // Sync Watchlist from Backend
  const syncWatchlist = async (silent = false) => {
    try {
      const data = await getWatchlist(token);
      setWatchlistItems(data);
    } catch (err) {
      setWatchlistError(err instanceof Error ? err.message : 'Could not fetch watchlist.');
      if (!silent) addNotification('Error', 'Failed to retrieve watchlist data.', 'warn');
    }
  };

  // Initial welcome notification and watchlist sync
  useEffect(() => {
    document.documentElement.classList.add('dark');
    if (token && user) {
      syncWatchlist(true);
      // Clean initials list to establish welcome message
      addNotification(
        'Workspace Online',
        `Logged in as ${user.email} (Provider: ${user.provider || 'credentials'})`,
        'info'
      );
    }
  }, [token]); // eslint-disable-line

  useEffect(() => { try { const stored = localStorage.getItem(STORAGE_KEY); if (stored) setHistory(JSON.parse(stored)); } catch { setHistory([]); } }, []);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 20))); } catch {} }, [history]);

  const running = status === 'running';
  const hasResult = status === 'complete' && Boolean(result);
  const selectedSnapshot = history.find((item) => item.id === selectedSnapshotId) || null;
  const activeDataset = selectedSnapshot || (result ? buildLiveSnapshot({ result, rawMarkdown, timeline, profile, quote, financials, news }) : null);

  // Spawning LangGraph notifications
  useEffect(() => {
    if (running) {
      addNotification('Research Spawning', `Initializing LangGraph loop on ticker ${company.toUpperCase()}`, 'info');
    }
  }, [running]); // eslint-disable-line

  useEffect(() => {
    if (!hasResult || !result) return;
    const snapshot = buildLiveSnapshot({ result, rawMarkdown, timeline, profile, quote, financials, news });
    setHistory((current) => [snapshot, ...current.filter((item) => item.ticker !== snapshot.ticker || item.rawMarkdown !== snapshot.rawMarkdown)].slice(0, 20));
    setSelectedSnapshotId(null);
    addNotification('Report Complete', `LangGraph resolving verdict: ${result.verdict} (${result.confidence}% confidence)`, 'success');
  }, [hasResult, result, rawMarkdown, timeline, profile, quote, financials, news]);

  const handleSearch = (targetOverride?: unknown) => {
    const target = typeof targetOverride === 'string' ? targetOverride.trim() : company.trim();
    if (!target || running) return;
    setSelectedSnapshotId(null); setActiveTab('dashboard'); setCompany(target);
    run(target, scenario, focus.regulatory, focus.insider);
  };
  const handleNewResearch = () => { reset(); setSelectedSnapshotId(null); setCompany(''); setActiveTab('dashboard'); };
  useEffect(() => { if (hasResult && messages.length === 0) ask(getChatIntro(), scenario); }, [hasResult]); // eslint-disable-line
  
  const handleAddToWatchlist = async (ticker: string, name: string) => {
    try {
      await addToWatchlist({ ticker, name }, token);
      await syncWatchlist(true);
      addNotification('Watchlist Updated', `Added ${ticker.toUpperCase()} to your saved watchlist.`, 'success');
    } catch (err) {
      addNotification('Watchlist Error', err instanceof Error ? err.message : 'Could not add to watchlist', 'warn');
    }
  };

  const handleRemoveFromWatchlist = async (ticker: string) => {
    try {
      await removeFromWatchlist(ticker, token);
      await syncWatchlist(true);
      addNotification('Watchlist Updated', `Removed ${ticker.toUpperCase()} from your saved watchlist.`, 'info');
    } catch (err) {
      addNotification('Watchlist Error', err instanceof Error ? err.message : 'Could not remove from watchlist', 'warn');
    }
  };

  const initials = (user?.name || 'AI').split(' ').map((item) => item[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="min-h-screen bg-aurora text-foreground">
      {/* Background decorative elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="animate-mesh-drift absolute -left-64 -top-64 h-[700px] w-[700px] rounded-full bg-emerald-500/5 blur-[140px]" />
        <div className="animate-mesh-drift absolute -bottom-64 -right-64 h-[600px] w-[600px] rounded-full bg-blue-500/5 blur-[140px]" style={{ animationDelay: '-7s' }} />
        <div className="absolute inset-0 bg-grid opacity-25" />
      </div>

      {/* Sticky header */}
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#05080f]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1360px] items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center">
              <img src="/favicon.png" alt="Aletheia" className="h-10 w-10" style={{ aspectRatio: '1 / 1' }} />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight text-white">Aletheia</h1>
              <p className="text-[11px] text-zinc-500">Research Workspace for Equity Analysis</p>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1.5 lg:flex">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200',
                  activeTab === item.id
                    ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30'
                    : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'
                )}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Real-time Notifications Bell */}
            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => { setNotificationsOpen((v) => !v); setUnreadNotifications(0); }}
                className="relative h-9 w-9 rounded-full text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
              >
                <Bell className="h-4 w-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[#05080f] animate-pulse" />
                )}
              </Button>
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-white/8 bg-[#0d1117]/95 p-3 shadow-2xl backdrop-blur-xl"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-2">
                      <p className="text-xs font-black text-white uppercase tracking-wider">Workspace updates</p>
                      <button
                        type="button"
                        onClick={() => { setNotifications([]); setUnreadNotifications(0); }}
                        className="text-[10px] font-bold text-zinc-500 hover:text-zinc-300 transition"
                      >
                        Clear logs
                      </button>
                    </div>
                    <div className="max-h-72 overflow-y-auto stream-scroll space-y-1.5 pr-1">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-zinc-600 italic py-4 text-center">No recent telemetry updates.</p>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={cn(
                              'rounded-xl border p-2.5 text-xs',
                              notif.type === 'success' ? 'border-emerald-500/10 bg-emerald-500/5 text-emerald-400' :
                              notif.type === 'warn' ? 'border-amber-500/10 bg-amber-500/5 text-amber-400' :
                              'border-white/5 bg-white/2 text-zinc-300'
                            )}
                          >
                            <div className="flex items-start justify-between gap-1.5">
                              <p className="font-bold text-white leading-normal truncate">{notif.title}</p>
                              <span className="text-[9px] text-zinc-600 shrink-0 font-semibold">{notif.time}</span>
                            </div>
                            <p className="mt-1 text-zinc-400 leading-relaxed text-[11px]">{notif.desc}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Avatar Trigger (sets tab to profile) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => { setProfileMenuOpen((v) => !v); setNotificationsOpen(false); }}
                className="flex items-center gap-2 rounded-full border border-white/8 bg-white/4 px-2 py-1.5 transition hover:border-emerald-500/30 hover:bg-white/6"
              >
                {user?.picture ? (
                  <img src={user.picture} alt="Avatar" className="h-7 w-7 rounded-full object-cover shadow-md shadow-emerald-500/25 border border-emerald-500/20" />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 text-xs font-black text-white shadow-md shadow-emerald-500/25">
                    {initials}
                  </span>
                )}
                <span className="hidden max-w-[130px] truncate text-sm font-semibold text-zinc-300 sm:block">
                  {user?.name || 'Profile'}
                </span>
                <ChevronDown className={cn("h-3.5 w-3.5 text-zinc-500 transition-transform", profileMenuOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {profileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-2xl border border-white/8 bg-[#0d1117]/95 p-1 shadow-2xl backdrop-blur-xl"
                  >
                    <button
                      onClick={() => { setActiveTab('profile'); setProfileMenuOpen(false); }}
                      className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-zinc-300 hover:bg-white/5 hover:text-white transition"
                    >
                      <User className="h-4 w-4" />
                      View Profile
                    </button>
                    <div className="my-1 h-px w-full bg-white/5" />
                    <button
                      onClick={() => { logout(); setProfileMenuOpen(false); }}
                      className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-red-400 hover:bg-red-400/10 transition"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile nav scrollable */}
        <div className="mx-auto flex max-w-[1360px] gap-2 overflow-x-auto px-4 pb-3 sm:px-6 lg:hidden">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-155',
                activeTab === item.id ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30' : 'bg-white/5 text-zinc-500'
              )}
            >
              <item.icon className="h-3 w-3" />
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 mx-auto max-w-[1360px] px-4 py-6 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DashboardPane
                company={company}
                setCompany={setCompany}
                running={running}
                activeDataset={activeDataset}
                steps={steps}
                progress={progress}
                phase={phase}
                onSearch={handleSearch}
                onReset={handleNewResearch}
                watchlistItems={watchlistItems}
                onAddToWatchlist={handleAddToWatchlist}
              />
            </motion.div>
          )}
          {activeTab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <HistoryPane history={history} selectedId={selectedSnapshotId} onLoad={(id) => { setSelectedSnapshotId(id); const item = history.find((e) => e.id === id); if (item) setCompany(item.ticker || item.company); setActiveTab('dashboard'); }} onRun={(ticker) => handleSearch(ticker)} />
            </motion.div>
          )}
          {activeTab === 'watchlist' && (
            <motion.div key="watchlist" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <WatchlistPane
                watchlist={watchlistItems}
                error={watchlistError}
                onResearch={(ticker) => handleSearch(ticker)}
                onRemove={handleRemoveFromWatchlist}
              />
            </motion.div>
          )}
          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProfilePane user={user} token={token} onSave={updateUser} logout={logout} addNotification={addNotification} />
            </motion.div>
          )}
          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SettingsPane
                apiEndpoint={apiEndpoint}
                setApiEndpoint={setApiEndpoint}
                analysisDepth={analysisDepth}
                setAnalysisDepth={setAnalysisDepth}
                quotaAlerts={quotaAlerts}
                setQuotaAlerts={setQuotaAlerts}
                socketProgress={socketProgress}
                setSocketProgress={setSocketProgress}
                onNavigateProfile={() => setActiveTab('profile')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard Pane
// ─────────────────────────────────────────────────────────────────────────────
function DashboardPane({
  company, setCompany, running, activeDataset, steps, progress, phase,
  onSearch, onReset, watchlistItems, onAddToWatchlist
}: {
  company: string; setCompany: (v: string) => void; running: boolean;
  activeDataset: ResearchSnapshot | null; steps: any[]; progress: number;
  phase: string; onSearch: (targetOverride?: string) => void; onReset: () => void;
  watchlistItems: Array<{ ticker: string; name: string }>;
  onAddToWatchlist: (ticker: string, name: string) => void;
}) {
  return (
    <>
      {/* Hero search card */}
      <DashboardCard className="mb-5 p-5 sm:p-6" glow>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-500">Research Workspace for Equity Analysis</p>
            </div>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
              Research any company,{' '}
              <span className="text-gradient-emerald">instantly.</span>
            </h2>
            <p className="mt-1.5 max-w-xl text-sm text-zinc-500">
              Search any company name or ticker symbol. The agent network retrieves live financial data and generates a full investment report.
            </p>
          </div>
          {activeDataset && (
            <Button onClick={onReset} variant="outline" className="shrink-0 rounded-full border-white/12 bg-white/5 font-bold text-zinc-300 hover:bg-white/8 hover:text-white">
              New Research
            </Button>
          )}
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
            <Input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') onSearch(); }}
              disabled={running}
              placeholder="Enter ticker or company name (e.g., Apple, AAPL, Tesla, NVDA)…"
              className="h-12 rounded-2xl border-white/8 bg-white/5 pl-11 text-base text-white placeholder:text-zinc-600 focus-visible:border-emerald-500/40 focus-visible:ring-emerald-500/20"
            />
          </div>
          <motion.div whileHover={{ scale: running ? 1 : 1.02 }} whileTap={{ scale: running ? 1 : 0.97 }}>
            <Button
              onClick={() => onSearch()}
              disabled={!company.trim() || running}
              className="h-12 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 font-black text-[#05080f] shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-emerald-500 hover:shadow-emerald-500/35 disabled:opacity-40 sm:w-auto"
            >
              {running ? 'Researching…' : 'Analyze'}
            </Button>
          </motion.div>
        </div>
      </DashboardCard>

      {/* Recommendations deck shown on empty Dashboard state */}
      {!running && !activeDataset && (
        <DashboardCard className="mb-5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Quick recommendations</span>
          </div>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-5">
            {RECOMMENDATIONS.map((rec) => {
              const inWatchlist = watchlistItems.some((item) => item.ticker === rec.ticker);
              return (
                <div
                  key={rec.ticker}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-white/3 p-3 transition hover:border-emerald-500/30 hover:bg-emerald-500/5 group"
                >
                  <div className="min-w-0 cursor-pointer flex-1" onClick={() => onSearch(rec.ticker)}>
                    <p className="text-sm font-black text-white">{rec.ticker}</p>
                    <p className="text-[10px] text-zinc-500 truncate leading-normal">{rec.name}</p>
                  </div>
                  <button
                    type="button"
                    disabled={inWatchlist}
                    onClick={() => onAddToWatchlist(rec.ticker, rec.name)}
                    className={cn(
                      'ml-2 h-7 w-7 rounded-lg flex items-center justify-center transition border',
                      inWatchlist
                        ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400'
                        : 'border-white/10 bg-white/5 text-zinc-400 hover:border-emerald-500 hover:text-[#05080f] hover:bg-emerald-500'
                    )}
                  >
                    {inWatchlist ? (
                      <span className="text-[9px] font-black">Saved</span>
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </DashboardCard>
      )}

      {running ? (
        <div className="flex items-center justify-center py-5">
          <ProcessingPipeline steps={steps as any} progress={progress} phase={phase} />
        </div>
      ) : activeDataset ? (
        <ResearchDashboard snapshot={activeDataset} steps={steps} watchlist={watchlistItems} onAdd={onAddToWatchlist} onSearch={onSearch} />
      ) : (
        <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <DashboardCard>
            <SectionTitle title="Agent Network Graph" subtitle="Pipeline nodes display here during active research execution" />
            <div className="mt-4 overflow-hidden rounded-2xl border border-white/8 bg-zinc-950">
              <ResearchGraphView steps={steps as any} />
            </div>
          </DashboardCard>
          <EmptyDashboard />
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Research Dashboard (results view)
// ─────────────────────────────────────────────────────────────────────────────
function ResearchDashboard({
  snapshot, steps, watchlist, onAdd, onSearch
}: {
  snapshot: ResearchSnapshot; steps: any[]; watchlist: any[];
  onAdd: (t: string, n: string) => void; onSearch: (t?: string) => void;
}) {
  const { result, profile, quote, financials, newsData, rawMarkdown, timelineCount } = snapshot;
  const derivedMetrics = useMemo(() => getDerivedMetrics(profile, financials, quote), [profile, financials, quote]);
  const news = useMemo(() => normalizeNews(newsData, result), [newsData, result]);
  const isSaved = watchlist.some((item) => item.ticker === (profile?.ticker || result.ticker));

  // Determine sector-related recommended tickers based on the searched ticker
  const similarTickers = useMemo(() => getSimilarTickers(profile?.ticker || result.ticker), [profile, result]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        {/* Graph */}
        <DashboardCard delay={0.01}>
          <SectionTitle title="Agent Network Graph" subtitle="Node transitions during the research lifecycle" />
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/8 bg-zinc-950">
            <ResearchGraphView steps={steps} />
          </div>
        </DashboardCard>

        {/* Company & verdict cards */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Company info */}
          <DashboardCard delay={0.02}>
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-lg font-black text-white shadow-lg shadow-emerald-500/25">
                {(profile?.ticker || result.ticker || 'AI').slice(0, 4)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-zinc-600">Asset Verification</p>
                  <button
                    type="button"
                    disabled={isSaved}
                    onClick={() => onAdd(profile?.ticker || result.ticker, profile?.name || result.company)}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black border transition',
                      isSaved
                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                        : 'border-white/10 bg-white/5 text-zinc-400 hover:border-emerald-500 hover:text-[#05080f] hover:bg-emerald-500'
                    )}
                  >
                    <Plus className="h-3 w-3" />
                    {isSaved ? 'In Watchlist' : 'Add to Watchlist'}
                  </button>
                </div>
                <h3 className="mt-1 truncate text-xl font-black tracking-tight text-white">{profile?.name || result.company}</h3>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  <Info label="Symbol" value={profile?.ticker || result.ticker || 'N/A'} />
                  <Info label="Industry" value={profile?.finnhubIndustry || 'N/A'} />
                  <Info label="Market Cap" value={derivedMetrics.marketCap} />
                  <Info label="Country" value={profile?.country || 'N/A'} />
                </div>
              </div>
            </div>
          </DashboardCard>

          {/* Verdict & confidence */}
          <DashboardCard delay={0.06} glow>
            <div className="flex h-full flex-col justify-between gap-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-zinc-600">AI Framework Output</p>
                  <div className="mt-3"><RecommendationBadge verdict={result.verdict} /></div>
                </div>
                <div className="rounded-2xl bg-emerald-500/12 p-3 text-emerald-400 ring-1 ring-emerald-500/20">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Score label="Research Confidence" value={result.confidence || 0} color="emerald" />
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>

      {/* Metrics + Analytics */}
      <div className="grid gap-5 lg:grid-cols-2">
        <DashboardCard delay={0.1}>
          <SectionTitle title="Valuation Metrics" subtitle="Key financial data vectors retrieved from market APIs" />
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {result.metrics?.map((item) => <MetricBox key={item.label} label={item.label} value={item.value} />)}
          </div>
        </DashboardCard>
        <DashboardCard delay={0.14}>
          <SectionTitle title="Network Analytics" subtitle={`${timelineCount} intelligence tracking steps resolved`} />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Sentiment label="Pros Tracked" value={result.pros?.length || 0} positive />
            <Sentiment label="Cons Tracked" value={result.cons?.length || 0} positive={false} />
          </div>
          <p className="mt-4 rounded-2xl border border-white/8 bg-white/3 p-3 text-sm leading-6 text-zinc-400 line-clamp-3">
            {result.executiveSummary?.[0] || 'Executive report data mounting is pending operational milestones.'}
          </p>
        </DashboardCard>
      </div>

      {/* Charts */}
      <DashboardCard delay={0.18}><DashboardCharts result={result} /></DashboardCard>

      {/* News */}
      <DashboardCard delay={0.22}>
        <SectionTitle title="Primary Cited Sources" subtitle="Top referenced sources utilized during the analysis" />
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {(news.length ? news : fallbackNews).map((item, i) => <NewsCard key={`${item.title}-${i}`} {...item} />)}
        </div>
      </DashboardCard>

      {/* Full report */}
      <DashboardCard delay={0.26}>
        <SectionTitle title="Complete AI Evaluation Report" subtitle="Structured analysis report from the LangGraph pipeline" />
        <div className="mt-5 rounded-2xl border border-white/8 bg-zinc-950/60 p-5">
          <MarkdownReport markdown={rawMarkdown || buildFallbackMarkdown(result)} />
        </div>
      </DashboardCard>

      {/* Similar & Related Companies deck at bottom of search results */}
      <DashboardCard delay={0.3} className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Related & Similar Companies</span>
        </div>
        <p className="text-xs text-zinc-500 mb-4">Click any related company below to run a deep agent research loop, or click the plus button to add to watchlist.</p>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
          {similarTickers.map((rec) => {
            const inWatchlist = watchlist.some((item) => item.ticker === rec.ticker);
            return (
              <div
                key={rec.ticker}
                className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/3 p-4 transition hover:border-emerald-500/30 hover:bg-emerald-500/5 group"
              >
                <div className="min-w-0 cursor-pointer flex-1" onClick={() => onSearch(rec.ticker)}>
                  <p className="text-base font-black text-white">{rec.ticker}</p>
                  <p className="text-xs text-zinc-500 truncate mt-0.5">{rec.name}</p>
                </div>
                <button
                  type="button"
                  disabled={inWatchlist}
                  onClick={() => onAdd(rec.ticker, rec.name)}
                  className={cn(
                    'ml-3 h-8 w-8 rounded-xl flex items-center justify-center transition border',
                    inWatchlist
                      ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400'
                      : 'border-white/10 bg-white/5 text-zinc-400 hover:border-emerald-500 hover:text-[#05080f] hover:bg-emerald-500'
                  )}
                >
                  {inWatchlist ? (
                    <span className="text-[10px] font-black">Saved</span>
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </DashboardCard>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// History Pane
// ─────────────────────────────────────────────────────────────────────────────
function HistoryPane({ history, selectedId, onLoad, onRun }: { history: ResearchSnapshot[]; selectedId: string | null; onLoad: (id: string) => void; onRun: (ticker: string) => void }) {
  return (
    <DashboardCard>
      <SectionTitle title="Research History" subtitle="Previous analyses stored locally across sessions" />
      <div className="mt-5 grid gap-3">
        {history.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/8 bg-white/3 p-8 text-center text-sm font-semibold text-zinc-600">
            No research history yet. Run your first analysis to see it here.
          </div>
        ) : history.map((item) => (
          <div key={item.id} className={cn('flex flex-col gap-3 rounded-2xl border transition sm:flex-row sm:items-center sm:justify-between', selectedId === item.id ? 'border-emerald-500/30 bg-emerald-500/8' : 'border-white/8 bg-white/3 hover:border-white/12 hover:bg-white/5')}>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-black text-emerald-400 ring-1 ring-emerald-500/20">{item.ticker}</span>
                <h3 className="truncate text-base font-black text-white">{item.company}</h3>
              </div>
              <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-zinc-600">
                <Clock3 className="h-3.5 w-3.5" /> {new Date(item.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => onLoad(item.id)} variant="outline" className="rounded-full border-white/12 bg-white/5 font-bold text-zinc-300 hover:bg-white/8 hover:text-white">Load</Button>
              <Button onClick={() => onRun(item.ticker)} className="rounded-full bg-emerald-500/15 font-bold text-emerald-400 ring-1 ring-emerald-500/25 hover:bg-emerald-500/25">Run Again</Button>
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Watchlist Pane (Persistent & backend integrated)
// ─────────────────────────────────────────────────────────────────────────────
function WatchlistPane({ watchlist, error, onResearch, onRemove }: {
  watchlist: Array<{ ticker: string; name: string }>;
  error: string | null;
  onResearch: (ticker: string) => void;
  onRemove: (ticker: string) => void;
}) {
  return (
    <div className="space-y-5">
      <DashboardCard>
        <SectionTitle title="Watchlist Portfolio" subtitle="Monitor saved assets and run parallel research pipelines" />

        {/* Watchlist Instructions */}
        <div className="mt-4 rounded-2xl border border-white/5 bg-white/3 p-4 flex gap-3 text-xs leading-5 text-zinc-400">
          <InfoIcon className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-white mb-0.5">How it works</p>
            <p>Your watchlist is stored securely in the cloud under your profile workspace. You can add assets using the quick recommendation row on the home dashboard, or by clicking the plus icon next to any active research search result. Save tickers to easily monitor or run deep loops on them later.</p>
          </div>
        </div>
      </DashboardCard>

      {error && (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400">
          {error}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {watchlist.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-white/8 bg-white/3 p-8 text-center text-sm font-semibold text-zinc-600">
            Portfolio tracking list is empty. Add companies from the home desk to get started.
          </div>
        ) : watchlist.map((asset) => (
          <DashboardCard key={asset.ticker} className="flex flex-col justify-between h-full">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xl font-black text-white">{asset.ticker}</p>
                  <p className="text-sm font-semibold text-zinc-500 line-clamp-1">{asset.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(asset.ticker)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center border border-white/10 bg-white/5 text-zinc-500 hover:border-red-500 hover:text-red-400 hover:bg-red-500/10 transition"
                  title="Remove from Watchlist"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <Button onClick={() => onResearch(asset.ticker)} className="mt-5 w-full rounded-full bg-emerald-500/15 font-bold text-emerald-400 ring-1 ring-emerald-500/25 hover:bg-emerald-500/25">
              <PlayCircle className="mr-2 h-4 w-4" /> Deep Research
            </Button>
          </DashboardCard>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Profile Pane (Tab view with user pic)
// ─────────────────────────────────────────────────────────────────────────────
function ProfilePane({ user, token, onSave, logout, addNotification }: {
  user: any; token: string | null; onSave: (updates: { name?: string; email?: string; picture?: string }) => void; logout: () => void;
  addNotification: (t: string, d: string, type?: 'info' | 'success' | 'warn') => void;
}) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  
  // Password updates state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // File selector for simulated profile picture
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfileSave = async (e: FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);
    if (!name.trim() || !email.trim()) return setProfileError('All profile fields are required.');
    setSavingProfile(true);

    try {
      const data = await postUpdateProfile({ name: name.trim(), email: email.trim() }, token);
      onSave({ name: data.user.name, email: data.user.email });
      setProfileSuccess('Profile details updated successfully.');
      addNotification('Profile Saved', 'User identity display details updated successfully.', 'success');
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Could not update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    if (!oldPassword || !newPassword || !confirmPassword) return setPasswordError('All password fields are required.');
    if (newPassword.length < 6) return setPasswordError('New password must contain at least 6 characters.');
    if (newPassword !== confirmPassword) return setPasswordError('Confirm password does not match.');
    setSavingPassword(true);

    try {
      await postUpdatePassword({ oldPassword, newPassword }, token);
      setPasswordSuccess('Your account password has been updated.');
      addNotification('Password Updated', 'Your local account password has been updated.', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Could not change password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      await deleteAccount(token);
      logout();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not delete your account.');
    } finally {
      setDeletingAccount(false);
    }
  };

  const initials = (user?.name || 'AI').split(' ').map((item: string) => item[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Edit Details */}
      <DashboardCard className="lg:col-span-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-5">
          <SectionTitle title="Account Identity" subtitle="Manage your workspace profile details" />
          <span className="text-xs font-semibold text-zinc-500 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
            Identity Provider: <span className="text-emerald-400 font-bold">{user?.provider === 'google' ? 'Google Auth' : 'Email Credentials'}</span>
          </span>
        </div>

        {/* Enhanced Profile Pic Block */}
        <div className="flex flex-col sm:flex-row items-center gap-5 bg-white/3 border border-white/5 p-5 rounded-2xl mb-6">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            {/* Avatar circle */}
            {user?.picture ? (
              <img src={user.picture} alt="Avatar" className="h-24 w-24 rounded-full object-cover border-2 border-emerald-400/40 shadow-lg shadow-emerald-500/10" />
            ) : (
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-black text-3xl border-2 border-emerald-400/40 shadow-lg shadow-emerald-500/10">
                {initials}
              </div>
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-[10px] font-bold text-white">
              <Camera className="h-4 w-4 mb-1" />
              Upload
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    if (event.target?.result) {
                      onSave({ picture: event.target.result as string });
                      addNotification('Avatar Uploaded', `Successfully updated profile picture.`, 'success');
                    }
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="hidden"
            />
          </div>
          <div className="text-center sm:text-left min-w-0">
            <h4 className="text-lg font-black text-white">{user?.name || 'Workspace Analyst'}</h4>
            <p className="text-sm text-zinc-500 truncate">{user?.email}</p>
            <p className="text-[10px] text-zinc-500 font-semibold mt-1">
              Click image to upload photo
            </p>
          </div>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1.5">Full name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 border-white/10 bg-white/5 text-white focus-visible:ring-emerald-500/30"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1.5">Email address</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 border-white/10 bg-white/5 text-white focus-visible:ring-emerald-500/30"
            />
          </div>

          <AnimatePresence>
            {profileError && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-semibold text-red-400">
                {profileError}
              </motion.p>
            )}
            {profileSuccess && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-semibold text-emerald-400">
                {profileSuccess}
              </motion.p>
            )}
          </AnimatePresence>

          <Button type="submit" disabled={savingProfile} className="rounded-xl bg-emerald-500 font-bold text-[#05080f] hover:bg-emerald-400">
            {savingProfile ? 'Saving details...' : 'Save Profile'}
          </Button>
        </form>
      </DashboardCard>

      {/* Password and delete settings */}
      <div className="space-y-6">
        {/* Change password */}
        <DashboardCard>
          <SectionTitle title="Security & Authentication" subtitle="Update local workspace password" />
          <form onSubmit={handlePasswordSave} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1.5">Current password</label>
              <Input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 border-white/10 bg-white/5 text-white focus-visible:ring-emerald-500/30"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1.5">New password</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 border-white/10 bg-white/5 text-white focus-visible:ring-emerald-500/30"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1.5">Confirm new password</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 border-white/10 bg-white/5 text-white focus-visible:ring-emerald-500/30"
              />
            </div>

            <AnimatePresence>
              {passwordError && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-semibold text-red-400">
                  {passwordError}
                </motion.p>
              )}
              {passwordSuccess && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-semibold text-emerald-400">
                  {passwordSuccess}
                </motion.p>
              )}
            </AnimatePresence>

            <Button type="submit" disabled={savingPassword} className="w-full rounded-xl bg-white/10 text-white hover:bg-white/15">
              {savingPassword ? 'Changing password...' : 'Update Password'}
            </Button>
          </form>
        </DashboardCard>

        {/* Delete account danger zone */}
        <DashboardCard className="border-red-500/20 bg-red-500/5">
          <div className="flex items-center gap-2">
            <X className="h-4 w-4 text-red-400" />
            <h3 className="text-sm font-black text-red-400 uppercase tracking-wider">Danger Zone</h3>
          </div>
          <p className="mt-2 text-xs text-red-200/70 leading-relaxed">
            Deleting your account will permanently wipe your profile details, stored research documents, and watchlist items. This action cannot be reversed.
          </p>

          <div className="mt-4">
            {!confirmDelete ? (
              <Button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="w-full rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20"
              >
                Delete Account
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-red-400 uppercase">Are you absolutely sure?</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={deletingAccount}
                    className="flex-1 rounded-xl bg-red-600 text-white font-bold py-2 text-xs hover:bg-red-700 transition"
                  >
                    Yes, Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 rounded-xl bg-white/10 text-zinc-300 font-bold py-2 text-xs hover:bg-white/15 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Settings Pane (with navigate profile settings card)
// ─────────────────────────────────────────────────────────────────────────────
function SettingsPane({
  apiEndpoint, setApiEndpoint, analysisDepth, setAnalysisDepth,
  quotaAlerts, setQuotaAlerts, socketProgress, setSocketProgress, onNavigateProfile
}: {
  apiEndpoint: ApiEndpoint; setApiEndpoint: (v: ApiEndpoint) => void;
  analysisDepth: AnalysisDepth; setAnalysisDepth: (v: AnalysisDepth) => void;
  quotaAlerts: boolean; setQuotaAlerts: (v: boolean) => void;
  socketProgress: boolean; setSocketProgress: (v: boolean) => void;
  onNavigateProfile: () => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-5">
      <DashboardCard>
        <SectionTitle title="Workspace Configuration" subtitle="Configure integration endpoints and processing parameters" />
        <div className="mt-5 space-y-4">
          <SettingBlock icon={Globe2} title="Active Network Endpoint" subtitle="Switch between production and staging environments">
            <SegmentedControl value={apiEndpoint} options={[['production', 'Production'], ['staging', 'Staging']]} onChange={(v) => setApiEndpoint(v as ApiEndpoint)} />
          </SettingBlock>
          
          <SettingBlock icon={User} title="Workspace Identity Profile" subtitle="Update user display details, password parameters, and account settings.">
            <Button onClick={onNavigateProfile} className="rounded-xl bg-emerald-500 font-bold text-[#05080f] hover:bg-emerald-400">
              Configure Profile Options
            </Button>
          </SettingBlock>

          <SettingBlock icon={Database} title="Analysis Depth" subtitle="Control agent execution scope and depth">
            <SegmentedControl value={analysisDepth} options={[['fast', 'Fast'], ['deep', 'Deep']]} onChange={(v) => setAnalysisDepth(v as AnalysisDepth)} />
          </SettingBlock>
          <SettingBlock icon={SlidersHorizontal} title="Runtime Options" subtitle="Manage interface updates and state tracking">
            <div className="grid gap-3 sm:grid-cols-2">
              <Toggle label="Socket streaming progress" checked={socketProgress} onChange={setSocketProgress} />
              <Toggle label="Quota usage alerts" checked={quotaAlerts} onChange={setQuotaAlerts} />
            </div>
          </SettingBlock>
        </div>
      </DashboardCard>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Micro-components & Helpers
// ─────────────────────────────────────────────────────────────────────────────
function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h3 className="text-lg font-black tracking-tight text-white">{title}</h3>
      <p className="mt-1 text-sm text-zinc-600">{subtitle}</p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-wider text-zinc-600">{label}</p>
      <p className="mt-1 truncate text-sm font-bold text-zinc-200">{value}</p>
    </div>
  );
}

function Score({ label, value, color }: { label: string; value: number; color: 'emerald' | 'red' | 'blue' }) {
  const bars: Record<string, string> = { emerald: 'bg-emerald-500', red: 'bg-red-500', blue: 'bg-blue-500' };
  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 p-3">
      <p className="text-[10px] font-black uppercase tracking-wider text-zinc-600">{label}</p>
      <p className="mt-1 text-xl font-black text-white">{value}%</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/8">
        <motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} className={`h-full ${bars[color]}`} />
      </div>
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 p-3 transition hover:border-emerald-500/20 hover:bg-emerald-500/5">
      <p className="text-[10px] font-black uppercase tracking-wider text-zinc-600">{label}</p>
      <p className="mt-1 truncate text-lg font-black text-white">{value}</p>
    </div>
  );
}

function Sentiment({ label, value, positive }: { label: string; value: number; positive: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 text-center ${positive ? 'border-emerald-500/20 bg-emerald-500/8' : 'border-red-500/20 bg-red-500/8'}`}>
      <p className={`text-2xl font-black ${positive ? 'text-emerald-400' : 'text-red-400'}`}>{value}</p>
      <p className={`mt-1 text-xs font-bold uppercase tracking-wider ${positive ? 'text-emerald-600' : 'text-red-600'}`}>{label}</p>
    </div>
  );
}

function NewsCard({ title, snippet, timestamp, url, source }: { title: string; snippet: string; timestamp: string; url: string; source: string }) {
  const safeUrl = url && url !== '#' ? url : undefined;
  return (
    <motion.article whileHover={{ y: -3, borderColor: 'rgba(52,211,153,0.2)' }} className="rounded-2xl border border-white/8 bg-white/3 p-3 transition">
      <p className="text-[10px] font-black uppercase tracking-wider text-emerald-500">{source}</p>
      <h4 className="mt-2 line-clamp-2 text-sm font-black leading-5 text-white">{title}</h4>
      <p className="mt-2 line-clamp-3 text-xs leading-5 text-zinc-500">{snippet}</p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold text-zinc-600">{timestamp}</span>
        {safeUrl ? (
          <a href={safeUrl} target="_blank" rel="noreferrer" className="rounded-full border border-emerald-500/20 bg-emerald-500/8 px-3 py-1 text-xs font-bold text-emerald-400 hover:bg-emerald-500/15">
            Read →
          </a>
        ) : (
          <span className="rounded-full border border-white/8 bg-white/3 px-3 py-1 text-xs font-bold text-zinc-600">No Link</span>
        )}
      </div>
    </motion.article>
  );
}

function EmptyDashboard() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <DashboardCard>
        <SectionTitle title="Asset Overview" subtitle="Run a search to populate this panel with company data" />
        <div className="mt-6 h-32 animate-shimmer rounded-2xl" />
      </DashboardCard>
      <DashboardCard>
        <SectionTitle title="Analytics Framework" subtitle="Evaluation charts appear after report generation" />
        <div className="mt-6 h-32 animate-shimmer rounded-2xl" />
      </DashboardCard>
    </div>
  );
}

function SettingBlock({ icon: Icon, title, subtitle, children }: { icon: typeof Database; title: string; subtitle: string; children: React.ReactNode }) {
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

function SegmentedControl({ value, options, onChange }: { value: string; options: Array<[string, string]>; onChange: (v: string) => void }) {
  return (
    <div className="inline-flex rounded-full border border-white/10 bg-white/4 p-1">
      {options.map(([id, label]) => (
        <button key={id} type="button" onClick={() => onChange(id)} className={cn('rounded-full px-4 py-2 text-sm font-bold transition', value === id ? 'bg-emerald-500 text-[#05080f] shadow-md' : 'text-zinc-500 hover:text-zinc-300')}>
          {label}
        </button>
      ))}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/3 p-3 text-left transition hover:border-white/12 hover:bg-white/5">
      <span className="text-sm font-bold text-zinc-300">{label}</span>
      <span className={cn('relative h-6 w-11 rounded-full transition-colors', checked ? 'bg-emerald-500' : 'bg-white/12')}>
        <span className={cn('absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all', checked ? 'left-6' : 'left-1')} />
      </span>
    </button>
  );
}

function buildLiveSnapshot({ result, rawMarkdown, timeline, profile, quote, financials, news }: { result: ResearchResult; rawMarkdown?: string; timeline: any[]; profile: any; quote: any; financials: any; news: any[] }): ResearchSnapshot {
  return { id: `${result.ticker || result.company}-${Date.now()}`, company: profile?.name || result.company, ticker: profile?.ticker || result.ticker || result.company, createdAt: new Date().toISOString(), result, rawMarkdown: rawMarkdown || buildFallbackMarkdown(result), timelineCount: timeline.length, profile, quote, financials, newsData: Array.isArray(news) ? news : [] };
}

function getDerivedMetrics(profile: any, financials: any, quote: any) {
  const fmt = (val: any, prefix = '', suffix = '') => {
    if (val === undefined || val === null || Number.isNaN(Number(val))) return 'N/A';
    return `${prefix}${Number(val).toLocaleString(undefined, { maximumFractionDigits: 2 })}${suffix}`;
  };
  const metrics = financials?.metric || {};
  const marketCap = profile?.marketCapitalization != null ? fmt(profile.marketCapitalization, '$', ' B') : 'N/A';
  return {
    marketCap,
    items: [
      { label: 'Current Price', value: quote?.c != null ? fmt(quote.c, '$') : 'N/A' },
      { label: 'Previous Close', value: quote?.pc != null ? fmt(quote.pc, '$') : 'N/A' },
      { label: 'Day High', value: quote?.h != null ? fmt(quote.h, '$') : 'N/A' },
      { label: 'Day Low', value: quote?.l != null ? fmt(quote.l, '$') : 'N/A' },
      { label: 'Market Cap', value: marketCap },
      { label: 'P/E Ratio', value: metrics.peTTM != null ? fmt(metrics.peTTM) : metrics.peBasicExclExtraTTM != null ? fmt(metrics.peBasicExclExtraTTM) : 'N/A' },
      { label: 'EPS', value: metrics.epsTTM != null ? fmt(metrics.epsTTM, '$') : 'N/A' },
      { label: 'Dividend Yield', value: metrics.dividendYieldIndicatedAnnual != null ? fmt(metrics.dividendYieldIndicatedAnnual, '', '%') : 'N/A' },
      { label: 'Beta', value: metrics.beta != null ? fmt(metrics.beta) : 'N/A' },
      { label: '52 Week High', value: metrics['52WeekHigh'] != null ? fmt(metrics['52WeekHigh'], '$') : 'N/A' },
      { label: '52 Week Low', value: metrics['52WeekLow'] != null ? fmt(metrics['52WeekLow'], '$') : 'N/A' },
      { label: '52W Return', value: metrics['52WeekPriceReturnDaily'] != null ? fmt(metrics['52WeekPriceReturnDaily'], '', '%') : 'N/A' },
    ],
  };
}

function normalizeNews(newsData: any[], result: ResearchResult) {
  if (Array.isArray(newsData) && newsData.length > 0) {
    return newsData.slice(0, 5).map((n: any) => ({ title: n.title || 'Untitled', snippet: n.description || 'No snippet.', source: n.source?.name || 'NewsAPI', timestamp: n.publishedAt ? new Date(n.publishedAt).toLocaleDateString() : '--', url: n.url || '#' }));
  }
  return (result.citations || []).slice(0, 5).map((item) => ({ title: item.title, snippet: item.snippet, source: item.source, timestamp: item.timestamp, url: item.url }));
}

function buildFallbackMarkdown(result: ResearchResult) {
  return `# ${result.company} Investment Report\n\n## Executive Summary\n${(result.executiveSummary || []).map((item) => `- ${item}`).join('\n') || '- Report generated from the latest research run.'}\n\n## Final Recommendation\n**${result.verdict}** with **${result.confidence}% confidence**.`;
}

// Determine sector-related recommended tickers
function getSimilarTickers(ticker: string) {
  const t = ticker.toUpperCase();
  if (['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'GOOG', 'AMD', 'INTC', 'NFLX', 'META', 'AMZN'].includes(t)) {
    return [
      { ticker: 'MSFT', name: 'Microsoft Corporation' },
      { ticker: 'NVDA', name: 'NVIDIA Corporation' },
      { ticker: 'AMD', name: 'Advanced Micro Devices' },
      { ticker: 'GOOGL', name: 'Alphabet Inc.' }
    ].filter(item => item.ticker !== t).slice(0, 3);
  }
  if (['TSLA', 'NIO', 'RIVN', 'LCID', 'F', 'GM'].includes(t)) {
    return [
      { ticker: 'RIVN', name: 'Rivian Automotive' },
      { ticker: 'F', name: 'Ford Motor Company' },
      { ticker: 'GM', name: 'General Motors Company' },
      { ticker: 'TSLA', name: 'Tesla, Inc.' }
    ].filter(item => item.ticker !== t).slice(0, 3);
  }
  return [
    { ticker: 'AAPL', name: 'Apple Inc.' },
    { ticker: 'MSFT', name: 'Microsoft Corp' },
    { ticker: 'TSLA', name: 'Tesla Inc.' }
  ].filter(item => item.ticker !== t).slice(0, 3);
}

const fallbackNews = [{ title: 'Research sources will appear here', snippet: 'News cards are populated from citations after the backend run completes.', timestamp: '--', url: '#', source: 'AI Research' }];

