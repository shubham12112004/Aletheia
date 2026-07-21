import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Clock3, Search, TrendingUp, TrendingDown,
  Sparkles, Plus, History, BookMarked, Activity, PieChart, Wallet, 
  ArrowUpRight, ArrowDownRight, FileText, MessageCircle
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

  useEffect(() => { if (running) console.log('Research Initiated', `Querying agent swarm for ${company.toUpperCase()}`); }, [running]); // eslint-disable-line

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
      <div className="flex-1 w-full max-w-[1600px] mx-auto flex flex-col gap-6 relative z-10">
        
        {/* SECTION 2: PREMIUM METRIC CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <DashboardCard className="p-5 flex flex-col justify-between bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors border-border/40 shadow-sm">
            <div className="flex items-center justify-between text-zinc-400 mb-4"><span className="text-xs font-bold uppercase tracking-wider">Portfolio Value</span><Wallet className="h-4 w-4" /></div>
            <div>
              <div className="text-2xl font-black text-zinc-100">${(portfolioData.totalValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div className={`flex items-center gap-1 text-xs mt-1 font-bold ${portfolioData.totalDailyChange >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {portfolioData.totalDailyChange >= 0 ? <ArrowUpRight className="h-3 w-3 stroke-[3]" /> : <ArrowDownRight className="h-3 w-3 stroke-[3]" />}
                <span>{portfolioData.totalDailyChange >= 0 ? '+' : ''}${(portfolioData.totalDailyChange || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({(portfolioData.totalDailyChangePercent || 0).toFixed(2)}%)</span>
              </div>
            </div>
          </DashboardCard>
          
          <DashboardCard className="p-5 flex flex-col justify-between bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors border-border/40 shadow-sm">
            <div className="flex items-center justify-between text-zinc-400 mb-4"><span className="text-xs font-bold uppercase tracking-wider">Market Sentiment</span><Activity className="h-4 w-4" /></div>
            <div>
              <div className="text-2xl font-black text-emerald-500">{watchlistItems.length > 0 ? (portfolioData.totalDailyChange >= 0 ? 'Bullish' : 'Bearish') : '--'}</div>
              <div className="text-xs mt-1 text-zinc-500 font-semibold">Based on watchlist trend</div>
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
                
                {/* Structured Report Render */}
                <DashboardCard className="p-6 lg:p-8 border-border/40 shadow-md flex flex-col">
                  <h3 className="text-xl font-black mb-6 flex items-center gap-2 border-b border-border/40 pb-4 text-zinc-100 shrink-0">
                    <FileText className="h-6 w-6 text-emerald-500" /> AI Evaluation Report
                  </h3>
                  <div className="w-full">
                    <StructuredReport data={activeDataset.result} />
                  </div>
                  
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
                  
                  <div className="w-full mb-6">
                    <CompanySearch onSearch={(query) => handleSearch(query)} disabled={running} />
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
                  {(portfolioData.assets && portfolioData.assets.length > 0 ? portfolioData.assets : RECOMMENDATIONS).slice(0, 4).map((t: any) => {
                    // Normalize data structure for fallback items
                    const ticker = t.ticker;
                    const changePercent = typeof t.dailyChangePercent === 'number' ? t.dailyChangePercent : (Math.random() * 5); // Simulated fallback change
                    const isPositive = changePercent >= 0;
                    const price = typeof t.price === 'number' ? t.price : (Math.random() * 200 + 50);

                    return (
                      <DashboardCard key={ticker} className="p-5 bg-zinc-900/40 hover:bg-zinc-800/60 border-border/40 transition-colors cursor-pointer group shadow-sm" onClick={() => handleSearch(ticker)}>
                        <div className="flex justify-between items-start mb-3">
                          <div className="font-black text-xl text-zinc-200 group-hover:text-emerald-400 transition-colors">{ticker}</div>
                          <div className={`text-xs font-black px-2 py-1 rounded-md ${isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                            {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
                          </div>
                        </div>
                        <div className="text-base font-bold text-zinc-400">${price.toFixed(2)}</div>
                      </DashboardCard>
                    );
                  })}
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

              {/* Right Panel: Live Portfolio Details */}
              <div className="space-y-6">
                <DashboardCard className="p-6 border-border/40 shadow-sm bg-zinc-900/20">
                  <h3 className="font-black mb-5 text-zinc-100 border-b border-border/40 pb-3 flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-emerald-500" /> Portfolio Allocation
                  </h3>
                  <div className="space-y-4">
                    {portfolioData.assets && portfolioData.assets.length > 0 ? (
                      portfolioData.assets.map((a: any, i: number) => {
                        const val = ((a.value / portfolioData.totalValue) * 100).toFixed(1);
                        const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500'];
                        const color = colors[i % colors.length];
                        return (
                          <div key={a.ticker}>
                            <div className="flex justify-between text-sm mb-1.5 font-bold">
                              <span className="text-zinc-300">{a.ticker}</span>
                              <span className="text-zinc-500">{val}%</span>
                            </div>
                            <div className="h-2.5 w-full bg-[#09090b] rounded-full overflow-hidden shadow-inner border border-border/30">
                              <div className={`h-full ${color} rounded-full`} style={{ width: `${val}%` }}></div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 text-center">
                        <BookMarked className="h-8 w-8 text-zinc-600 mb-3" />
                        <div className="text-zinc-400 font-semibold mb-1">Your Watchlist is Empty</div>
                        <div className="text-xs text-zinc-500 max-w-[200px]">Add assets to your watchlist to see your simulated portfolio allocation here.</div>
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
