import { useEffect, useState } from 'react';
import { getMarketOverview } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { ArrowUpRight, ArrowDownRight, Loader2, TrendingUp } from 'lucide-react';
import { DashboardCard } from '@/components/dashboard/DashboardCard';

type MarketData = {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
};

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
        setError(err instanceof Error ? err.message : 'Failed to load markets');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  return (
    <div className="flex-1 w-full max-w-[1600px] mx-auto flex flex-col gap-6 relative z-10 p-4 md:p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
          <TrendingUp className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-zinc-100 tracking-tight">Markets Overview</h1>
          <p className="text-zinc-400 font-medium mt-1">Live index data and macro trends</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : error ? (
        <div className="text-rose-500 bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl font-bold">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.map((item) => (
            <DashboardCard key={item.ticker} className="p-6 bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors border-border/40">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-black text-white">{item.ticker}</h3>
                  <p className="text-sm text-zinc-400">{item.name}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-black text-zinc-100">${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                <div className={`flex items-center gap-1 text-sm mt-2 font-bold ${item.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {item.change >= 0 ? <ArrowUpRight className="h-4 w-4 stroke-[3]" /> : <ArrowDownRight className="h-4 w-4 stroke-[3]" />}
                  <span>{item.change >= 0 ? '+' : ''}{item.change.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({item.changePercent.toFixed(2)}%)</span>
                </div>
              </div>
            </DashboardCard>
          ))}
        </div>
      )}
    </div>
  );
}
