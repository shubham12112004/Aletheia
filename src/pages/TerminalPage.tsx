import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Clock3, Search, TrendingUp, TrendingDown,
  Sparkles, Plus, History, BookMarked, Activity, PieChart, Wallet, 
  ArrowUpRight, ArrowDownRight, FileText, MessageCircle, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useResearchAgent } from '@/hooks/useResearchAgent';
import { MACRO_SCENARIOS } from '@/lib/mockData';
import type { FocusFilters, MacroScenario, ResearchResult } from '@/lib/types';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { ProcessingPipeline } from '@/components/dashboard/ProcessingPipeline';
import { RecommendationBadge } from '@/components/dashboard/RecommendationBadge';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { StructuredReport } from '@/components/dashboard/StructuredReport';
import { OnboardingModal } from '@/components/dashboard/OnboardingModal';
import { getWatchlist, addToWatchlist, getPortfolio } from '@/lib/api';
import { DashboardChatbot } from '@/components/dashboard/DashboardChatbot';
import { CompanySearch } from '@/components/dashboard/CompanySearch';

type ResearchSnapshot = {
  id: string; company: string; ticker: string; createdAt: string;
  result: ResearchResult; rawMarkdown: string; timelineCount: number;
  profile: any; quote: any; financials: any; newsData: any[];
};

const STORAGE_KEY = 'aletheia.researchHistory';

const RECOMMENDATIONS = [
  { ticker: 'NVDA', name: 'NVIDIA Corporation' },
  { ticker: 'AAPL', name: 'Apple Inc.' },
  { ticker: 'MSFT', name: 'Microsoft Corporation' },
  { ticker: 'AMZN', name: 'Amazon.com, Inc.' },
  { ticker: 'TSLA', name: 'Tesla, Inc.' }
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

export function TerminalPage() {
  const { user, token } = useAuth();
  const { status, phase, steps, result, rawMarkdown, progress, messages, timeline, profile, quote, financials, news, run, reset, ask, clearChat, error } = useResearchAgent();
  
  const [company, setCompany] = useState('');
  const [scenario] = useState<MacroScenario>(MACRO_SCENARIOS[2]);
  const [focus] = useState<FocusFilters>({ regulatory: true, insider: false });
  const [history, setHistory] = useState<ResearchSnapshot[]>([]);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [watchlistItems, setWatchlistItems] = useState<Array<{ ticker: string; name: string }>>([]);
  const [portfolioData, setPortfolioData] = useState<any>({ totalValue: 0, totalDailyChange: 0, totalDailyChangePercent: 0 });

  const syncWatchlist = async () => {
    try {
      const items = await getWatchlist(token);
      setWatchlistItems(items);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token && user) {
      syncWatchlist();
      getPortfolio(token).then(setPortfolioData).catch(console.error);
    }
  }, [token]); // eslint-disable-line

  useEffect(() => { try { const stored = localStorage.getItem(STORAGE_KEY); if (stored) setHistory(JSON.parse(stored)); } catch { setHistory([]); } }, []);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 20))); } catch (e) { /* ignore */ } }, [history]);

  const running = status === 'running';
  const hasResult = status === 'complete' && Boolean(result);
  const activeDataset = (history.find((item) => item.id === selectedSnapshotId)) || (result ? buildLiveSnapshot({ result, rawMarkdown, timeline, profile, quote, financials, news }) : null);

  useEffect(() => {
    if (!hasResult || !result) return;
    const snapshot = buildLiveSnapshot({ result, rawMarkdown, timeline, profile, quote, financials, news });
    setHistory((current) => [snapshot, ...current.filter((item) => item.ticker !== snapshot.ticker || item.rawMarkdown !== snapshot.rawMarkdown)].slice(0, 20));
    setSelectedSnapshotId(null);
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
      await syncWatchlist();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="flex-1 w-full max-w-[1600px] mx-auto flex flex-col gap-6 relative z-10 p-4 sm:p-6 lg:p-8">
        
        {/* TOP METRIC DASHBOARD WIDGETS */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Widget 1: Portfolio Value */}
          <DashboardCard className="p-5 flex flex-col justify-between bg-[#090d16]/70 border-white/10 hover:border-emerald-500/30 transition-all shadow-md">
            <div className="flex items-center justify-between text-zinc-400 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Portfolio Value</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <Wallet className="h-3.5 w-3.5" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-white tracking-tight font-mono">
                ${(portfolioData.totalValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className={`flex items-center gap-1 text-xs mt-1.5 font-bold ${portfolioData.totalDailyChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {portfolioData.totalDailyChange >= 0 ? <ArrowUpRight className="h-3.5 w-3.5 stroke-[3]" /> : <ArrowDownRight className="h-3.5 w-3.5 stroke-[3]" />}
                <span>{portfolioData.totalDailyChange >= 0 ? '+' : ''}${(portfolioData.totalDailyChange || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({(portfolioData.totalDailyChangePercent || 0).toFixed(2)}%)</span>
              </div>
            </div>
          </DashboardCard>
          
          {/* Widget 2: Market Sentiment */}
          <DashboardCard className="p-5 flex flex-col justify-between bg-[#090d16]/70 border-white/10 hover:border-emerald-500/30 transition-all shadow-md">
            <div className="flex items-center justify-between text-zinc-400 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Market Sentiment</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                <Activity className="h-3.5 w-3.5" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-400 tracking-tight">
                {watchlistItems.length > 0 ? (portfolioData.totalDailyChange >= 0 ? 'Bullish' : 'Bearish') : 'Neutral'}
              </div>
              <div className="text-xs mt-1.5 text-zinc-500 font-semibold">Based on active tracking trends</div>
            </div>
          </DashboardCard>
          
          {/* Widget 3: AI Confidence Score */}
          <DashboardCard className="p-5 flex flex-col justify-between bg-[#090d16]/70 border-white/10 hover:border-emerald-500/30 transition-all shadow-md">
            <div className="flex items-center justify-between text-zinc-400 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">AI Confidence Score</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-white tracking-tight font-mono">
                {activeDataset?.result?.confidence ? `${activeDataset.result.confidence}%` : '88%'}
              </div>
              <div className="text-xs mt-1.5 text-zinc-500 font-semibold">For {activeDataset?.ticker || 'Global Context'}</div>
            </div>
          </DashboardCard>

          {/* Widget 4: Active Watchlist Count */}
          <DashboardCard className="p-5 flex flex-col justify-between bg-[#090d16]/70 border-white/10 hover:border-emerald-500/30 transition-all shadow-md">
            <div className="flex items-center justify-between text-zinc-400 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Active Watchlist</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400">
                <BookMarked className="h-3.5 w-3.5" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-white tracking-tight font-mono">{watchlistItems.length}</div>
              <div className="text-xs mt-1.5 text-zinc-500 font-semibold">Tracked equities & ETFs</div>
            </div>
          </DashboardCard>

          {/* Widget 5: Market Telemetry Status */}
          <DashboardCard className="p-5 flex flex-col justify-between bg-[#090d16]/70 border-white/10 hover:border-emerald-500/30 transition-all shadow-md">
            <div className="flex items-center justify-between text-zinc-400 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Market Telemetry</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                <Clock3 className="h-3.5 w-3.5" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-400 tracking-tight flex items-center gap-2">
                Open <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <div className="text-xs mt-1.5 text-zinc-500 font-semibold">NASDAQ / NYSE Feed</div>
            </div>
          </DashboardCard>
        </div>

        {/* DYNAMIC DASHBOARD CENTERPIECE AREA */}
        <div className="flex flex-col flex-1 gap-6">
          {running ? (
            <DashboardCard className="py-16 flex items-center justify-center min-h-[520px] border-white/10 bg-[#090d16]/60 backdrop-blur-xl">
               <ProcessingPipeline steps={steps as any} progress={progress} phase={phase} />
            </DashboardCard>
          ) : error ? (
            <DashboardCard className="border-rose-500/30 bg-rose-500/5 min-h-[500px] flex items-center justify-center">
              <div className="flex flex-col items-center text-center max-w-md p-8">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 shadow-inner border border-rose-500/20">
                  <TrendingDown className="h-8 w-8" />
                </div>
                <h3 className="mb-2 text-2xl font-black text-white">Analysis Interrupted</h3>
                <p className="mb-6 text-xs text-zinc-400 leading-relaxed">{error}</p>
                <Button onClick={handleNewResearch} className="bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white border border-rose-500/30 font-bold px-8 h-11 rounded-xl">
                  Acknowledge & Reset
                </Button>
              </div>
            </DashboardCard>
          ) : activeDataset ? (
            /* ACTIVE AI RESEARCH PANEL REPORT */
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="grid lg:grid-cols-[1fr_380px] gap-6">
              <div className="space-y-6">
                
                {/* Active Equity Overview Card */}
                <DashboardCard className="p-6 lg:p-8 border-white/10 bg-[#090d16]/80 backdrop-blur-2xl shadow-xl">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-white/5 pb-6">
                    <div className="flex items-center gap-5">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-600 to-teal-800 flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-emerald-500/20 font-mono">
                        {activeDataset.ticker.slice(0, 2)}
                      </div>
                      <div>
                        <h2 className="text-3xl font-black tracking-tight text-white">{activeDataset.company}</h2>
                        <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1.5 font-semibold">
                          <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">{activeDataset.ticker}</span>
                          <span>•</span>
                          <span>{activeDataset.profile?.finnhubIndustry || 'Technology'}</span>
                          <span>•</span>
                          <span>{activeDataset.profile?.country || 'US'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <RecommendationBadge verdict={activeDataset.result.verdict} />
                      <button
                        onClick={() => handleAddToWatchlist(activeDataset.ticker, activeDataset.company)}
                        className="text-xs font-bold text-zinc-400 hover:text-emerald-400 flex items-center gap-1.5 transition-colors group bg-white/5 hover:bg-emerald-500/10 px-3 py-1.5 rounded-full border border-white/10 hover:border-emerald-500/30"
                      >
                        <Plus className="h-3.5 w-3.5 group-hover:rotate-90 transition-transform" /> Add to Watchlist
                      </button>
                    </div>
                  </div>
                  
                  {/* Valuation / Financial Metrics Mini Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-5 rounded-2xl bg-black/50 border border-white/5 shadow-inner">
                     {activeDataset.result.metrics?.slice(0,4).map((m, idx) => (
                       <div key={m.label || idx}>
                         <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">{m.label}</div>
                         <div className="text-xl font-black text-zinc-100 font-mono">{m.value}</div>
                       </div>
                     ))}
                  </div>

                  <DashboardCharts result={activeDataset.result} />
                </DashboardCard>
                
                {/* Structured AI Report */}
                <DashboardCard className="p-6 lg:p-8 border-white/10 bg-[#090d16]/80 backdrop-blur-2xl shadow-xl flex flex-col">
                  <h3 className="text-xl font-black mb-6 flex items-center gap-2.5 border-b border-white/5 pb-4 text-white shrink-0">
                    <FileText className="h-5 w-5 text-emerald-400" /> Institutional AI Evaluation Report
                  </h3>
                  <div className="w-full">
                    <StructuredReport data={activeDataset.result} />
                  </div>
                  
                  {/* Smart Follow-ups */}
                  {activeDataset.result.suggestedQuestions && activeDataset.result.suggestedQuestions.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-white/5">
                      <h4 className="text-xs font-bold mb-4 uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-emerald-400" /> Suggested Analyst Follow-ups
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {activeDataset.result.suggestedQuestions.map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              const event = new CustomEvent('open-chat-with-query', { detail: q });
                              window.dispatchEvent(event);
                            }}
                            className="rounded-full bg-white/5 border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-300 hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all text-left shadow-sm"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </DashboardCard>
              </div>

              {/* Right Panel: AI Recommendation & Live News */}
              <div className="space-y-6">
                <DashboardCard className="p-6 bg-gradient-to-b from-emerald-500/10 via-[#090d16] to-[#090d16] border-emerald-500/20 shadow-xl">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" /> Agent Consensus
                  </h3>
                  <div className="text-4xl font-black mb-1 text-white tracking-tight">{activeDataset.result.verdict}</div>
                  <div className="text-xs text-zinc-400 mb-6 font-semibold">{activeDataset.result.confidence}% Algorithm Confidence</div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="p-4 rounded-2xl bg-black/40 border border-white/5 shadow-inner">
                      <div className="text-[11px] font-black text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5 stroke-[3]" /> Primary Bull Signal
                      </div>
                      <div className="text-xs font-semibold text-zinc-300 leading-snug">
                        {activeDataset.result.pros?.[0]?.text || 'Strong fundamentals detected across key metrics'}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-black/40 border border-white/5 shadow-inner">
                      <div className="text-[11px] font-black text-rose-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <TrendingDown className="h-3.5 w-3.5 stroke-[3]" /> Primary Bear Risk
                      </div>
                      <div className="text-xs font-semibold text-zinc-300 leading-snug">
                        {activeDataset.result.cons?.[0]?.text || 'Macroeconomic factors suggest elevated volatility'}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => setIsChatOpen(true)}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold h-11 rounded-xl shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-500 transition-all text-xs"
                  >
                    Interrogate Research Agent
                  </Button>
                </DashboardCard>

                {/* Live News Intel */}
                <DashboardCard className="p-6 border-white/10 bg-[#090d16]/70 shadow-md">
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-4 border-b border-white/5 pb-3 text-zinc-400 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-emerald-400" /> Live Market Intel
                  </h3>
                  <div className="space-y-4">
                    {activeDataset.newsData?.slice(0, 5).map((n, i) => (
                      <a key={i} href={n.url || '#'} target="_blank" rel="noreferrer" className="block group border-b border-white/5 pb-3 last:border-0 last:pb-0">
                        <div className="flex justify-between items-start mb-1">
                          <div className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase">
                            {n.source?.name || 'Bloomberg'}
                          </div>
                        </div>
                        <div className="text-xs font-semibold text-zinc-300 group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                          {n.title}
                        </div>
                      </a>
                    ))}
                  </div>
                </DashboardCard>
              </div>
            </motion.div>
          ) : (
            /* IDLE DASHBOARD OVERVIEW */
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="grid lg:grid-cols-[1fr_380px] gap-6">
              
              <div className="space-y-6">
                {/* Hero Command Search Panel (Perplexity AI visual style) */}
                <DashboardCard className="p-8 lg:p-14 flex flex-col items-center justify-center min-h-[360px] bg-gradient-to-b from-[#090d16] via-[#090d16]/90 to-[#05080f] border-white/10 text-center relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
                  
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-600 to-teal-800 text-white shadow-xl shadow-emerald-500/20 mb-5">
                    <Search className="h-7 w-7 stroke-[2.5]" />
                  </div>
                  
                  <h2 className="text-3xl lg:text-4xl font-black tracking-tight mb-2 text-white">
                    Global Market Intelligence Terminal
                  </h2>
                  <p className="text-xs lg:text-sm text-zinc-400 mb-8 max-w-lg font-medium leading-relaxed">
                    Search any equity ticker, ETF, or company to trigger autonomous AI research swarms.
                  </p>
                  
                  <div className="w-full mb-6 max-w-2xl">
                    <CompanySearch onSearch={(query) => handleSearch(query)} disabled={running} />
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mr-1">Trending:</span>
                    {RECOMMENDATIONS.map(r => (
                      <button
                        key={r.ticker}
                        onClick={() => handleSearch(r.ticker)}
                        className="text-xs font-bold px-3 py-1 rounded-full bg-white/5 hover:bg-emerald-500/20 hover:border-emerald-500/40 hover:text-emerald-400 transition-all border border-white/10 text-zinc-300 font-mono"
                      >
                        {r.ticker}
                      </button>
                    ))}
                  </div>
                </DashboardCard>

                {/* Trending Stock Ticker Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(portfolioData.assets && portfolioData.assets.length > 0 ? portfolioData.assets : RECOMMENDATIONS).slice(0, 4).map((t: any) => {
                    const ticker = t.ticker;
                    const changePercent = typeof t.dailyChangePercent === 'number' ? t.dailyChangePercent : 2.45;
                    const isPositive = changePercent >= 0;
                    const price = typeof t.price === 'number' ? t.price : 185.20;

                    return (
                      <DashboardCard
                        key={ticker}
                        className="p-4 bg-[#090d16]/70 border-white/10 hover:border-emerald-500/30 transition-all cursor-pointer group shadow-sm"
                        onClick={() => handleSearch(ticker)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-black text-lg text-white group-hover:text-emerald-400 transition-colors font-mono">{ticker}</div>
                          <div className={`text-[10px] font-black px-2 py-0.5 rounded ${isPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                            {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
                          </div>
                        </div>
                        <div className="text-sm font-bold text-zinc-400 font-mono">${price.toFixed(2)}</div>
                      </DashboardCard>
                    );
                  })}
                </div>

                {/* Recent Research History Grid */}
                {history.length > 0 && (
                  <DashboardCard className="p-6 border-white/10 bg-[#090d16]/60 shadow-md">
                    <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-4">
                      <h3 className="font-black text-white flex items-center gap-2 text-sm">
                        <History className="h-4 w-4 text-emerald-400" /> Recent AI Research Reports
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {history.slice(0, 4).map(item => (
                        <div
                          key={item.id}
                          onClick={() => setSelectedSnapshotId(item.id)}
                          className="p-4 rounded-xl border border-white/10 bg-black/40 hover:border-emerald-500/30 transition-all cursor-pointer flex justify-between items-center group shadow-sm"
                        >
                          <div>
                            <div className="font-bold text-sm text-zinc-200 group-hover:text-emerald-400 transition-colors truncate max-w-[160px]">
                              {item.company}
                            </div>
                            <div className="text-xs text-zinc-500 font-medium flex items-center gap-2 mt-0.5">
                              <span className="font-bold text-emerald-400 font-mono">{item.ticker}</span>
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

              {/* Right Panel: Portfolio Allocation Widget */}
              <div className="space-y-6">
                <DashboardCard className="p-6 border-white/10 bg-[#090d16]/60 shadow-md">
                  <h3 className="font-black mb-5 text-white border-b border-white/5 pb-3 flex items-center gap-2 text-sm">
                    <PieChart className="h-4 w-4 text-emerald-400" /> Simulated Portfolio Allocation
                  </h3>
                  <div className="space-y-4">
                    {portfolioData.assets && portfolioData.assets.length > 0 ? (
                      portfolioData.assets.map((a: any, i: number) => {
                        const val = ((a.value / portfolioData.totalValue) * 100).toFixed(1);
                        const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-teal-500'];
                        const color = colors[i % colors.length];
                        return (
                          <div key={a.ticker}>
                            <div className="flex justify-between text-xs mb-1.5 font-bold">
                              <span className="text-zinc-200 font-mono">{a.ticker}</span>
                              <span className="text-zinc-400">{val}%</span>
                            </div>
                            <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
                              <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${val}%` }} />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <BookMarked className="h-10 w-10 text-zinc-600 mb-3 stroke-[1.5]" />
                        <div className="text-xs font-bold text-zinc-300 mb-1">Your Watchlist is Empty</div>
                        <div className="text-[11px] text-zinc-500 max-w-[200px]">
                          Add equities to your watchlist to see your simulated portfolio allocation here.
                        </div>
                      </div>
                    )}
                  </div>
                </DashboardCard>
              </div>

            </motion.div>
          )}
        </div>
      </div>

      <DashboardChatbot 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        messages={messages} 
        onAsk={(text: string) => ask(text, scenario)}
        onClear={clearChat}
      />
      <OnboardingModal />
    </>
  );
}
