import { useEffect, useState } from 'react';
import { getMarketOverview } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Activity, Globe } from 'lucide-react';
import { DashboardCard } from '@/components/dashboard/DashboardCard';

type MarketData = {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
};

const SECTORS = [
  { name: 'Information Technology', change: '+1.84%', isPositive: true },
  { name: 'Healthcare & Biotech', change: '+0.62%', isPositive: true },
  { name: 'Financial Services', change: '-0.34%', isPositive: false },
  { name: 'Consumer Discretionary', change: '+1.12%', isPositive: true },
  { name: 'Energy & Utilities', change: '-0.88%', isPositive: false },
  { name: 'Industrials', change: '+0.45%', isPositive: true },
];

export function MarketsPage() {
  const { token } = useAuth();
  const [data, setData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getMarketOverview(token);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load market data');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  return (
    <div className="flex-1 w-full max-w-[1600px] mx-auto flex flex-col gap-6 relative z-10 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
          <TrendingUp className="h-6 w-6 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Market Indices & Macro Trends</h1>
          <p className="text-xs text-zinc-400 font-medium mt-1">Real-time telemetry streams from global exchange feeds</p>
        </div>
      </div>

      {/* Main Indices Grid */}
      <div>
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Globe className="h-4 w-4 text-emerald-400" /> Primary Market Benchmarks
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 rounded-2xl border border-white/5 bg-white/[0.02] p-6 animate-pulse space-y-4">
                <div className="h-6 w-24 bg-white/10 rounded-md" />
                <div className="h-10 w-40 bg-white/10 rounded-md" />
                <div className="h-4 w-32 bg-white/10 rounded-md" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-rose-400 bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl font-bold text-xs">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.map((item) => {
              const isPositive = item.change >= 0;
              return (
                <DashboardCard key={item.ticker} className="p-6 bg-[#090d16]/80 border-white/10 hover:border-emerald-500/30 transition-all shadow-xl">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-black text-white font-mono">{item.ticker}</h3>
                      <p className="text-xs text-zinc-400 font-medium mt-0.5">{item.name}</p>
                    </div>
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${isPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                      {isPositive ? <ArrowUpRight className="h-5 w-5 stroke-[2.5]" /> : <ArrowDownRight className="h-5 w-5 stroke-[2.5]" />}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/5">
                    <div className="text-3xl font-black text-white font-mono">
                      ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs mt-2 font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      <span>{isPositive ? '+' : ''}{item.change.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({item.changePercent.toFixed(2)}%) Today</span>
                    </div>
                  </div>
                </DashboardCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Sector Performance Grid */}
      <div className="mt-4">
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-400" /> Sector Telemetry Breakdown
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SECTORS.map((sector) => (
            <div key={sector.name} className="p-5 rounded-2xl border border-white/10 bg-[#090d16]/60 backdrop-blur-xl flex justify-between items-center hover:border-white/20 transition-all">
              <div>
                <p className="text-sm font-bold text-zinc-200">{sector.name}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono mt-0.5">S&P 500 Sub-Group</p>
              </div>
              <span className={`text-xs font-black px-2.5 py-1 rounded-md font-mono ${sector.isPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                {sector.change}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
