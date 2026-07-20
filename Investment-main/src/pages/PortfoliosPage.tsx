import { useEffect, useState } from 'react';
import { getPortfolio } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Briefcase as BriefcaseIcon, Loader2, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { DashboardCard } from '@/components/dashboard/DashboardCard';

type PortfolioAsset = {
  ticker: string;
  name: string;
  shares: number;
  price: number;
  value: number;
  dailyChange: number;
  dailyChangePercent: number;
};

type PortfolioData = {
  totalValue: number;
  totalDailyChange: number;
  totalDailyChangePercent: number;
  assets: PortfolioAsset[];
};

export function PortfoliosPage() {
  const { token } = useAuth();
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getPortfolio(token);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load portfolio data');
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
          <BriefcaseIcon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-zinc-100 tracking-tight">Portfolios</h1>
          <p className="text-zinc-400 font-medium mt-1">Simulated holdings based on your watchlist</p>
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
      ) : data ? (
        <div className="space-y-6">
          <DashboardCard className="p-8 bg-zinc-900/40 border border-border/40 max-w-2xl">
            <div className="flex items-center gap-3 text-zinc-400 mb-2 font-bold uppercase tracking-wider text-sm">
              <Wallet className="h-5 w-5" />
              <span>Total Simulated Value</span>
            </div>
            <div className="text-5xl font-black text-zinc-100 mb-4">
              ${data.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`flex items-center gap-2 font-bold text-lg ${data.totalDailyChange >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {data.totalDailyChange >= 0 ? <ArrowUpRight className="h-5 w-5 stroke-[3]" /> : <ArrowDownRight className="h-5 w-5 stroke-[3]" />}
              <span>{data.totalDailyChange >= 0 ? '+' : ''}${data.totalDailyChange.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="text-sm opacity-80 px-2 py-0.5 rounded-full bg-current bg-opacity-20">
                {data.totalDailyChange >= 0 ? '+' : ''}{data.totalDailyChangePercent.toFixed(2)}% Today
              </span>
            </div>
          </DashboardCard>

          <h2 className="text-xl font-bold text-zinc-100 mt-8 mb-4">Your Assets</h2>
          <div className="bg-zinc-900/40 border border-border/40 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-900/60 text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-border/40">
                    <th className="p-4 pl-6">Asset</th>
                    <th className="p-4">Shares</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Total Value</th>
                    <th className="p-4 pr-6">Today's Return</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 text-sm font-medium">
                  {data.assets.map((asset) => (
                    <tr key={asset.ticker} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                           <span className="font-bold text-zinc-100 bg-zinc-800/50 px-2 py-1 rounded">{asset.ticker}</span>
                           <span className="text-zinc-400">{asset.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-zinc-300">{asset.shares}</td>
                      <td className="p-4 text-zinc-100">${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="p-4 text-zinc-100 font-bold">${asset.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className={`p-4 pr-6 font-bold ${asset.dailyChangePercent >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            {asset.dailyChangePercent >= 0 ? <ArrowUpRight className="h-3 w-3 stroke-[3]" /> : <ArrowDownRight className="h-3 w-3 stroke-[3]" />}
                            {asset.dailyChangePercent >= 0 ? '+' : ''}{asset.dailyChangePercent.toFixed(2)}%
                          </div>
                          <div className="text-xs opacity-70">
                            {asset.dailyChange >= 0 ? '+' : ''}${asset.dailyChange.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {data.assets.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-zinc-500">
                        No simulated assets found. Add items to your watchlist!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
