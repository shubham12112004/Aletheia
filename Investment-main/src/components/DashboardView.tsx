import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, BrainCircuit, ChevronDown, Clock3, Database, Globe2, LogOut, PlayCircle, Search, Settings, SlidersHorizontal, TrendingUp, User, X } from 'lucide-react';
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

type ActiveTab = 'dashboard' | 'history' | 'watchlist' | 'settings';
type AnalysisDepth = 'fast' | 'deep';
type ApiEndpoint = 'production' | 'staging';
type ResearchSnapshot = { id: string; company: string; ticker: string; createdAt: string; result: ResearchResult; rawMarkdown: string; timelineCount: number; profile: any; quote: any; financials: any; newsData: any[] };

const STORAGE_KEY = 'aletheia.researchHistory';
const navItems: Array<{ id: ActiveTab; label: string }> = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'history', label: 'Research History' },
  { id: 'watchlist', label: 'Watchlist' },
  { id: 'settings', label: 'Settings' },
];

// Note: Static mock watchlist metrics removed for temporary safety. Populate dynamically from data layer hooks.
const watchlist: any[] = [];

export function DashboardView() {
  const { user, logout, updateUser } = useAuth();
  const { status, phase, steps, result, rawMarkdown, progress, messages, timeline, profile, quote, financials, news, run, reset, ask } = useResearchAgent();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [company, setCompany] = useState('');
  const [scenario] = useState<MacroScenario>(MACRO_SCENARIOS[2]);
  const [focus] = useState<FocusFilters>({ regulatory: true, insider: false });
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(2);
  const [history, setHistory] = useState<ResearchSnapshot[]>([]);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null);
  const [apiEndpoint, setApiEndpoint] = useState<ApiEndpoint>('production');
  const [analysisDepth, setAnalysisDepth] = useState<AnalysisDepth>('deep');
  const [quotaAlerts, setQuotaAlerts] = useState(true);
  const [socketProgress, setSocketProgress] = useState(true);

  useEffect(() => { document.documentElement.classList.remove('dark'); }, []);
  useEffect(() => { try { const stored = localStorage.getItem(STORAGE_KEY); if (stored) setHistory(JSON.parse(stored)); } catch { setHistory([]); } }, []);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 20))); } catch {} }, [history]);

  const running = status === 'running';
  const hasResult = status === 'complete' && Boolean(result);
  const selectedSnapshot = history.find((item) => item.id === selectedSnapshotId) || null;
  const activeDataset = selectedSnapshot || (result ? buildLiveSnapshot({ result, rawMarkdown, timeline, profile, quote, financials, news }) : null);

  useEffect(() => {
    if (!hasResult || !result) return;
    const snapshot = buildLiveSnapshot({ result, rawMarkdown, timeline, profile, quote, financials, news });
    setHistory((current) => [snapshot, ...current.filter((item) => item.ticker !== snapshot.ticker || item.rawMarkdown !== snapshot.rawMarkdown)].slice(0, 20));
    setSelectedSnapshotId(null);
  }, [hasResult, result, rawMarkdown, timeline, profile, quote, financials, news]);

  const handleSearch = (targetOverride?: unknown) => {
    const target = typeof targetOverride === 'string' ? targetOverride.trim() : company.trim();
    if (!target || running) return;
    setSelectedSnapshotId(null); setActiveTab('dashboard'); setCompany(target);
    run(target, scenario, focus.regulatory, focus.insider);
  };
  const handleNewResearch = () => { reset(); setSelectedSnapshotId(null); setCompany(''); setActiveTab('dashboard'); };
  useEffect(() => { if (hasResult && messages.length === 0) ask(getChatIntro(), scenario); }, [hasResult]);
  const initials = (user?.name || 'AI').split(' ').map((item) => item[0]).slice(0, 2).join('').toUpperCase();
  
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1360px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/25"><BrainCircuit className="h-5 w-5" /></div><div><h1 className="text-base font-black tracking-tight">Aletheia AI Workspace</h1><p className="text-xs text-slate-500">Autonomous Market Intelligence</p></div></div>
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => <button key={item.id} type="button" onClick={() => setActiveTab(item.id)} className={cn('rounded-full px-3 py-2 text-sm font-semibold transition', activeTab === item.id ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' : 'text-slate-500 hover:bg-blue-50 hover:text-blue-700')}>{item.label}</button>)}
          </nav>
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block"><Button type="button" variant="ghost" size="icon" onClick={() => setNotificationsOpen((value) => !value)} className="relative rounded-full text-slate-500 hover:bg-slate-100"><Bell className="h-4 w-4" />{unreadNotifications > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />}</Button>{notificationsOpen && <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl"><div className="flex items-center justify-between"><p className="font-black text-slate-900">Notifications</p><button type="button" onClick={() => setUnreadNotifications(0)} className="text-xs font-bold text-blue-600">Mark read</button></div><div className="mt-3 space-y-2 text-sm"><div className="rounded-xl bg-blue-50 p-3 text-slate-700"><p className="font-bold">Workspace online</p><p className="mt-1 text-xs text-slate-500">Research services are connected.</p></div><div className="rounded-xl bg-slate-50 p-3 text-slate-700"><p className="font-bold">Security enabled</p><p className="mt-1 text-xs text-slate-500">Cloudflare protection is active for sign-in.</p></div></div></div>}</div>
            <div className="relative">
              <button type="button" onClick={() => setMenuOpen((value) => !value)} className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-sm transition hover:border-blue-200 hover:shadow-md"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-black text-white">{initials}</span><span className="hidden max-w-[140px] truncate text-sm font-semibold text-slate-700 sm:block">{user?.name || 'Profile'}</span><ChevronDown className="h-4 w-4 text-slate-400" /></button>
              {menuOpen && <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                <div className="border-b border-slate-100 px-4 py-3"><p className="truncate text-sm font-bold text-slate-900">{user?.name || 'Investor'}</p><p className="truncate text-xs text-slate-500">{user?.email}</p></div>
                <button onClick={() => { setMenuOpen(false); setProfileOpen(true); }} className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-slate-600 hover:bg-slate-50"><User className="h-4 w-4" /> Profile</button>
                <button onClick={() => { setMenuOpen(false); setActiveTab('settings'); }} className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-slate-600 hover:bg-slate-50"><Settings className="h-4 w-4" /> Settings</button>
                <button onClick={logout} className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50"><LogOut className="h-4 w-4" /> Sign out</button>
              </div>}
            </div>
          </div>
        </div>
        <div className="mx-auto flex max-w-[1360px] gap-2 overflow-x-auto px-4 pb-3 sm:px-6 lg:hidden lg:px-8">{navItems.map((item) => <button key={item.id} type="button" onClick={() => setActiveTab(item.id)} className={cn('shrink-0 rounded-full px-3 py-1.5 text-xs font-bold', activeTab === item.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600')}>{item.label}</button>)}</div>
      </header>
      <main className="mx-auto max-w-[1360px] px-4 py-5 sm:px-6 lg:px-8">
        {activeTab === 'dashboard' && <DashboardPane company={company} setCompany={setCompany} running={running} activeDataset={activeDataset} steps={steps} progress={progress} phase={phase} onSearch={handleSearch} onReset={handleNewResearch} />}
        {activeTab === 'history' && <HistoryPane history={history} selectedId={selectedSnapshotId} onLoad={(id) => { setSelectedSnapshotId(id); const item = history.find((entry) => entry.id === id); if (item) setCompany(item.ticker || item.company); setActiveTab('dashboard'); }} onRun={(ticker) => handleSearch(ticker)} />}
        {activeTab === 'watchlist' && <WatchlistPane onResearch={(ticker) => handleSearch(ticker)} />}
        {activeTab === 'settings' && <SettingsPane apiEndpoint={apiEndpoint} setApiEndpoint={setApiEndpoint} analysisDepth={analysisDepth} setAnalysisDepth={setAnalysisDepth} quotaAlerts={quotaAlerts} setQuotaAlerts={setQuotaAlerts} socketProgress={socketProgress} setSocketProgress={setSocketProgress} />}
      </main>
      {profileOpen && <ProfileModal user={user} tokenState="active" onClose={() => setProfileOpen(false)} onSave={updateUser} />}
    </div>
  );
}

function DashboardPane({ company, setCompany, running, activeDataset, steps, progress, phase, onSearch, onReset }: { company: string; setCompany: (value: string) => void; running: boolean; activeDataset: ResearchSnapshot | null; steps: any[]; progress: number; phase: string; onSearch: () => void; onReset: () => void }) {
  return <>
    <DashboardCard className="mb-5 p-4 sm:p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">Dashboard</p><h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Investment Intelligence Desk</h2><p className="mt-1 max-w-2xl text-sm text-slate-500">Search any company name or ticker symbol to monitor live financial structures built by the agent network.</p></div>{activeDataset && <Button onClick={onReset} variant="outline" className="rounded-full border-slate-200 bg-white font-bold text-slate-700 hover:bg-slate-50">New Research</Button>}</div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input value={company} onChange={(event) => setCompany(event.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { onSearch(); } }} disabled={running} placeholder="Enter Ticker or Company Name (e.g., Apple, AAPL, Tesla, NVDA)..." className="h-12 rounded-2xl border-slate-200 bg-slate-50 pl-11 text-base shadow-inner focus-visible:ring-blue-500" /></div><motion.div whileHover={{ scale: running ? 1 : 1.02 }} whileTap={{ scale: running ? 1 : 0.98 }}><Button onClick={() => onSearch()} disabled={!company.trim() || running} className="h-12 w-full rounded-2xl bg-blue-600 px-8 font-black text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 hover:shadow-blue-500/35 sm:w-auto">{running ? 'Researching...' : 'Search'}</Button></motion.div></div>
    </DashboardCard>
    {running ? <div className="flex items-center justify-center py-3 sm:py-5"><ProcessingPipeline steps={steps as any} progress={progress} phase={phase} /></div> : activeDataset ? <ResearchDashboard snapshot={activeDataset} steps={steps} /> : <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]"><DashboardCard><SectionTitle title="Agent Network Graph" subtitle="Data ingestion tracking steps display here during execution lifecycle" /><div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950"><ResearchGraphView steps={steps as any} /></div></DashboardCard><EmptyDashboard /></div>}
  </>;
}

function ResearchDashboard({ snapshot, steps }: { snapshot: ResearchSnapshot; steps: any[] }) {
  const { result, profile, quote, financials, newsData, rawMarkdown, timelineCount } = snapshot;
  const derivedMetrics = useMemo(() => getDerivedMetrics(profile, financials, quote), [profile, financials, quote]);
  const news = useMemo(() => normalizeNews(newsData, result), [newsData, result]);
  
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
    <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
      <DashboardCard delay={0.01}>
        <SectionTitle title="Agent Network Graph" subtitle="Latest state transitions within the research network lifecycle" />
        {/* ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Fix: Changed steps={[]} to steps={steps} to visualize running parameters cleanly */}
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950"><ResearchGraphView steps={steps} /></div>
      </DashboardCard>
      <div className="grid gap-5 lg:grid-cols-2">
        <DashboardCard delay={0.02}>
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-sky-400 text-lg font-black text-white shadow-lg shadow-blue-500/20">{(profile?.ticker || result.ticker || 'AI').slice(0, 4)}</div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Asset Verification</p>
              <h3 className="mt-1 truncate text-2xl font-black tracking-tight text-slate-950">{profile?.name || result.company}</h3>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <Info label="Symbol" value={profile?.ticker || result.ticker || 'N/A'} />
                <Info label="Industry" value={profile?.finnhubIndustry || 'N/A'} />
                <Info label="Market Cap" value={derivedMetrics.marketCap} />
                <Info label="Country" value={profile?.country || 'N/A'} />
              </div>
            </div>
          </div>
        </DashboardCard>
        <DashboardCard delay={0.06}>
          <div className="flex h-full flex-col justify-between gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">AI Framework Output</p>
                <div className="mt-3"><RecommendationBadge verdict={result.verdict} /></div>
              </div>
              <div className="rounded-2xl bg-blue-50 p-3 text-blue-700"><TrendingUp className="h-6 w-6" /></div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Score label="Research Confidence" value={result.confidence || 0} color="blue" />
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
    <div className="grid gap-5 lg:grid-cols-2">
      <DashboardCard delay={0.1}>
        <SectionTitle title="Valuation Metrics Overview" subtitle="Key data vectors retrieved from server storage instances" />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {result.metrics?.map((item) => <MetricBox key={item.label} label={item.label} value={item.value} />)}
        </div>
      </DashboardCard>
      <DashboardCard delay={0.14}>
        <SectionTitle title="Network Analytics Summary" subtitle={`${timelineCount} intelligence tracking steps resolved`} />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Sentiment label="Pros Tracked" value={result.pros?.length || 0} className="bg-emerald-50 text-emerald-700" />
          <Sentiment label="Cons Tracked" value={result.cons?.length || 0} className="bg-red-50 text-red-700" />
        </div>
        <p className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-600 line-clamp-3">{result.executiveSummary?.[0] || 'Executive report data mounting is pending operational milestones.'}</p>
      </DashboardCard>
    </div>
    <DashboardCard delay={0.18}><DashboardCharts result={result} /></DashboardCard>
    <DashboardCard delay={0.22}>
      <SectionTitle title="Primary Cited Artifacts" subtitle="Top referenced indices utilized during target calculation" />
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">{(news.length ? news : fallbackNews).map((item, index) => <NewsCard key={`${item.title}-${index}`} {...item} />)}</div>
    </DashboardCard>
    <DashboardCard delay={0.26} className="mb-8">
      <SectionTitle title="Complete AI Evaluation Report" subtitle="Structured analysis report mapped from target LLM interface" />
      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-5"><MarkdownReport markdown={rawMarkdown || buildFallbackMarkdown(result)} /></div>
    </DashboardCard>
  </motion.div>;
}

function HistoryPane({ history, selectedId, onLoad, onRun }: { history: ResearchSnapshot[]; selectedId: string | null; onLoad: (id: string) => void; onRun: (ticker: string) => void }) {
  return <DashboardCard><SectionTitle title="Local Workspace History" subtitle="Previous operations are preserved locally across runtime sessions" /><div className="mt-5 grid gap-3">{history.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">No operations history registered on this workstation instance.</div> : history.map((item) => <div key={item.id} className={cn('flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between', selectedId === item.id ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-slate-50')}><div className="min-w-0"><div className="flex items-center gap-2"><span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-black text-white">{item.ticker}</span><h3 className="truncate text-base font-black text-slate-950">{item.company}</h3></div><p className="mt-2 flex items-center gap-1 text-xs font-semibold text-slate-500"><Clock3 className="h-3.5 w-3.5" /> {new Date(item.createdAt).toLocaleString()}</p></div><div className="flex gap-2"><Button onClick={() => onLoad(item.id)} variant="outline" className="rounded-full bg-white font-bold">Load Dataset</Button><Button onClick={() => onRun(item.ticker)} className="rounded-full bg-blue-600 font-bold text-white hover:bg-blue-700">Run Again</Button></div></div>)}</div></DashboardCard>;
}

function WatchlistPane({ onResearch }: { onResearch: (ticker: string) => void }) {
  return <div className="space-y-5"><DashboardCard><SectionTitle title="Watchlist Portfolio" subtitle="Monitor core identifiers and launch parallel evaluation pipelines" /></DashboardCard><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{watchlist.length === 0 ? <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">Portfolio index tracking list empty.</div> : watchlist.map((asset) => <DashboardCard key={asset.ticker}><div className="flex items-start justify-between gap-3"><div><p className="text-xl font-black text-slate-950">{asset.ticker}</p><p className="text-sm font-semibold text-slate-500">{asset.name}</p></div></div><Button onClick={() => onResearch(asset.ticker)} className="mt-4 w-full rounded-full bg-blue-600 font-bold text-white hover:bg-blue-700"><PlayCircle className="mr-2 h-4 w-4" /> Deep Research</Button></DashboardCard>)}</div></div>;
}

function SettingsPane({ apiEndpoint, setApiEndpoint, analysisDepth, setAnalysisDepth, quotaAlerts, setQuotaAlerts, socketProgress, setSocketProgress }: { apiEndpoint: ApiEndpoint; setApiEndpoint: (value: ApiEndpoint) => void; analysisDepth: AnalysisDepth; setAnalysisDepth: (value: AnalysisDepth) => void; quotaAlerts: boolean; setQuotaAlerts: (value: boolean) => void; socketProgress: boolean; setSocketProgress: (value: boolean) => void }) {
  return <div className="grid grid-cols-1 gap-5"><DashboardCard><SectionTitle title="Workspace Configuration" subtitle="Configure integration target endpoints and processing loops" /><div className="mt-5 space-y-4"><SettingBlock icon={Globe2} title="Active Network Node Route" subtitle="Switch operational configuration variables safely across deployment layers"><SegmentedControl value={apiEndpoint} options={[[ 'production', 'Production Env' ], [ 'staging', 'Staging Link' ]]} onChange={(value) => setApiEndpoint(value as ApiEndpoint)} /></SettingBlock><SettingBlock icon={BrainCircuit} title="Multi-Agent Execution Controls" subtitle="Expand evaluation parameters across standard deep logic trees"><SegmentedControl value={analysisDepth} options={[[ 'fast', 'Fast Verification' ], [ 'deep', 'Deep Analysis' ]]} onChange={(value) => setAnalysisDepth(value as AnalysisDepth)} /></SettingBlock><SettingBlock icon={SlidersHorizontal} title="Runtime Interface Options" subtitle="Manage layout updates and structural state tracking"><div className="grid gap-3 sm:grid-cols-2"><Toggle label="Socket streaming tracking instances" checked={socketProgress} onChange={setSocketProgress} /><Toggle label="System message verification alerts" checked={quotaAlerts} onChange={setQuotaAlerts} /></div></SettingBlock></div></DashboardCard></div>;
}

function ProfileModal({ user, tokenState, onClose, onSave }: { user: any; tokenState: string; onClose: () => void; onSave: (updates: { name?: string; email?: string }) => void }) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const save = () => { if (!name.trim() || !email.trim()) return; onSave({ name: name.trim(), email: email.trim() }); onClose(); };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"><motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Profile settings</p><h3 className="mt-1 text-xl font-black text-slate-950">Edit workspace identity</h3></div><Button onClick={onClose} variant="ghost" size="icon" className="rounded-full"><X className="h-4 w-4" /></Button></div><div className="mt-6 space-y-4"><label className="block text-sm font-bold text-slate-700">Display name<Input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 h-11 rounded-xl border-slate-200" /></label><label className="block text-sm font-bold text-slate-700">Email address<Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-11 rounded-xl border-slate-200" /></label><p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">Session: <span className="font-bold text-emerald-600">{tokenState}</span></p><div className="flex justify-end gap-2"><Button variant="outline" onClick={onClose} className="rounded-xl">Cancel</Button><Button onClick={save} className="rounded-xl bg-blue-600 text-white hover:bg-blue-700">Save changes</Button></div></div></motion.div></div>;
}
function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) { return <div><h3 className="text-lg font-black tracking-tight text-slate-950">{title}</h3><p className="mt-1 text-sm text-slate-500">{subtitle}</p></div>; }
function Info({ label, value }: { label: string; value: string }) { return <div><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 truncate text-sm font-bold text-slate-900">{value}</p></div>; }
function Score({ label, value, color }: { label: string; value: number; color: 'blue' | 'red' | 'green' }) { const colors = { blue: 'bg-blue-600', red: 'bg-red-500', green: 'bg-emerald-500' }; return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3"><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-xl font-black text-slate-950">{value}%</p><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200"><motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} className={`h-full ${colors[color]}`} /></div></div>; }
function MetricBox({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3"><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 truncate text-lg font-black text-slate-950">{value}</p></div>; }
function Sentiment({ label, value, className }: { label: string; value: number; className: string }) { return <div className={`rounded-2xl p-4 text-center ${className}`}><p className="text-2xl font-black">{value}</p><p className="mt-1 text-xs font-bold uppercase tracking-wider opacity-80">{label}</p></div>; }
function NewsCard({ title, snippet, timestamp, url, source }: { title: string; snippet: string; timestamp: string; url: string; source: string }) { const safeUrl = url && url !== '#' ? url : undefined; return <motion.article whileHover={{ y: -3 }} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:bg-white hover:shadow-md"><p className="text-[10px] font-black uppercase tracking-wider text-blue-600">{source}</p><h4 className="mt-2 line-clamp-2 text-sm font-black leading-5 text-slate-950">{title}</h4><p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">{snippet}</p><div className="mt-3 flex items-center justify-between gap-2"><span className="text-[10px] font-semibold text-slate-400">{timestamp}</span>{safeUrl ? <a href={safeUrl} target="_blank" rel="noreferrer" className="rounded-full bg-white px-3 py-1 text-xs font-bold text-blue-700 shadow-sm hover:bg-blue-50">Read More</a> : <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-400 shadow-sm">No Link</span>}</div></motion.article>; }
function EmptyDashboard() { return <div className="grid gap-5 lg:grid-cols-2"><DashboardCard><SectionTitle title="Asset Overview Context" subtitle="Initiate workspace lookup query parameters to populate dashboard" /><div className="mt-6 h-32 rounded-2xl border border-dashed border-slate-200 bg-slate-50" /></DashboardCard><DashboardCard><SectionTitle title="Stock Analytics Framework" subtitle="Evaluation summary charts mount upon process resolution" /><div className="mt-6 h-32 rounded-2xl border border-dashed border-slate-200 bg-slate-50" /></DashboardCard></div>; }
function SettingBlock({ icon: Icon, title, subtitle, children }: { icon: typeof Database; title: string; subtitle: string; children: React.ReactNode }) { return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-start gap-3"><div className="rounded-2xl bg-white p-3 text-blue-700 shadow-sm"><Icon className="h-5 w-5" /></div><div className="min-w-0 flex-1"><p className="font-black text-slate-950">{title}</p><p className="mt-1 text-sm text-slate-500">{subtitle}</p><div className="mt-4">{children}</div></div></div></div>; }
function SegmentedControl({ value, options, onChange }: { value: string; options: Array<[string, string]>; onChange: (value: string) => void }) { return <div className="inline-flex rounded-full border border-slate-200 bg-white p-1">{options.map(([id, label]) => <button key={id} type="button" onClick={() => onChange(id)} className={cn('rounded-full px-4 py-2 text-sm font-bold transition', value === id ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-blue-700')}>{label}</button>)}</div>; }
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) { return <button type="button" onClick={() => onChange(!checked)} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 text-left"><span className="text-sm font-bold text-slate-700">{label}</span><span className={cn('relative h-6 w-11 rounded-full transition', checked ? 'bg-blue-600' : 'bg-slate-300')}><span className={cn('absolute top-1 h-4 w-4 rounded-full bg-white transition', checked ? 'left-6' : 'left-1')} /></span></button>; }
function buildLiveSnapshot({ result, rawMarkdown, timeline, profile, quote, financials, news }: { result: ResearchResult; rawMarkdown?: string; timeline: any[]; profile: any; quote: any; financials: any; news: any[] }): ResearchSnapshot { return { id: `${result.ticker || result.company}-${Date.now()}`, company: profile?.name || result.company, ticker: profile?.ticker || result.ticker || result.company, createdAt: new Date().toISOString(), result, rawMarkdown: rawMarkdown || buildFallbackMarkdown(result), timelineCount: timeline.length, profile, quote, financials, newsData: Array.isArray(news) ? news : [] }; }
function getDerivedMetrics(profile: any, financials: any, quote: any) {
  const formatNumber = (
    val: any,
    prefix = "",
    suffix = ""
  ) => {
    if (
      val === undefined ||
      val === null ||
      Number.isNaN(Number(val))
    ) {
      return "N/A";
    }

    return `${prefix}${Number(val).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })}${suffix}`;
  };

  const metrics = financials?.metric || {};

  const marketCap =
    profile?.marketCapitalization != null
      ? formatNumber(profile.marketCapitalization, "$", " B")
      : "N/A";

  return {
    marketCap,

    items: [
      {
        label: "Current Price",
        value:
          quote?.c != null
            ? formatNumber(quote.c, "$")
            : "N/A",
      },

      {
        label: "Previous Close",
        value:
          quote?.pc != null
            ? formatNumber(quote.pc, "$")
            : "N/A",
      },

      {
        label: "Day High",
        value:
          quote?.h != null
            ? formatNumber(quote.h, "$")
            : "N/A",
      },

      {
        label: "Day Low",
        value:
          quote?.l != null
            ? formatNumber(quote.l, "$")
            : "N/A",
      },

      {
        label: "Market Cap",
        value: marketCap,
      },

      {
        label: "P/E Ratio",
        value:
          metrics.peTTM != null
            ? formatNumber(metrics.peTTM)
            : metrics.peBasicExclExtraTTM != null
            ? formatNumber(metrics.peBasicExclExtraTTM)
            : "N/A",
      },

      {
        label: "EPS",
        value:
          metrics.epsTTM != null
            ? formatNumber(metrics.epsTTM, "$")
            : "N/A",
      },

      {
        label: "Dividend Yield",
        value:
          metrics.dividendYieldIndicatedAnnual != null
            ? formatNumber(
                metrics.dividendYieldIndicatedAnnual,
                "",
                "%"
              )
            : "N/A",
      },

      {
        label: "Beta",
        value:
          metrics.beta != null
            ? formatNumber(metrics.beta)
            : "N/A",
      },

      {
        label: "52 Week High",
        value:
          metrics["52WeekHigh"] != null
            ? formatNumber(metrics["52WeekHigh"], "$")
            : "N/A",
      },

      {
        label: "52 Week Low",
        value:
          metrics["52WeekLow"] != null
            ? formatNumber(metrics["52WeekLow"], "$")
            : "N/A",
      },

      {
        label: "52 Week Price Return",
        value:
          metrics["52WeekPriceReturnDaily"] != null
            ? formatNumber(
                metrics["52WeekPriceReturnDaily"],
                "",
                "%"
              )
            : "N/A",
      },
    ],
  };
}function normalizeNews(newsData: any[], result: ResearchResult) { if (Array.isArray(newsData) && newsData.length > 0) return newsData.slice(0, 5).map((n: any) => ({ title: n.title || 'Untitled source', snippet: n.description || 'No snippet available.', source: n.source?.name || 'News API', timestamp: n.publishedAt ? new Date(n.publishedAt).toLocaleDateString() : '--', url: n.url || '#' })); return (result.citations || []).slice(0, 5).map((item) => ({ title: item.title, snippet: item.snippet, source: item.source, timestamp: item.timestamp, url: item.url })); }
function buildFallbackMarkdown(result: ResearchResult) { return `# ${result.company} Investment Report\n\n## Executive Summary\n${(result.executiveSummary || []).map((item) => `- ${item}`).join('\n') || '- Report generated from the latest research run.'}\n\n## Final Recommendation\n**${result.verdict}** with **${result.confidence}% confidence**.`; }
const fallbackNews = [{ title: 'Research sources will appear here', snippet: 'News cards are populated from citations after the backend run completes.', timestamp: '--', url: '#', source: 'AI Research' }];