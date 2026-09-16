import { useEffect, useState } from 'react';
import { getPortfolio } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Briefcase as BriefcaseIcon, ArrowUpRight, ArrowDownRight, Wallet, BookMarked } from 'lucide-react';
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
    <div className="flex-1 w-full max-w-[1600px] mx-auto flex flex-col gap-6 relative z-10 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
          <BriefcaseIcon className="h-6 w-6 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Active Portfolio Holdings</h1>
          <p className="text-xs text-zinc-400 font-medium mt-1">Simulated portfolio performance based on tracked equities</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="h-44 max-w-2xl rounded-2xl border border-white/5 bg-white/[0.02] p-6 animate-pulse space-y-4">
            <div className="h-4 w-32 bg-white/10 rounded-md" />
            <div className="h-10 w-48 bg-white/10 rounded-md" />
          </div>
          <div className="h-64 rounded-2xl border border-white/5 bg-white/[0.02] p-6 animate-pulse" />
        </div>
      ) : error ? (
        <div className="text-rose-400 bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl font-bold text-xs">
          {error}
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Total Value Summary Card */}
          <DashboardCard className="p-8 bg-[#090d16]/80 border-white/10 max-w-2xl shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-2 text-zinc-400 mb-3 font-bold uppercase tracking-wider text-xs">
              <Wallet className="h-4 w-4 text-emerald-400" />
              <span>Total Simulated Portfolio Value</span>
            </div>
            <div className="text-5xl font-black text-white mb-4 font-mono tracking-tight">
              ${data.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`flex items-center gap-2 font-bold text-base ${data.totalDailyChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {data.totalDailyChange >= 0 ? <ArrowUpRight className="h-5 w-5 stroke-[3]" /> : <ArrowDownRight className="h-5 w-5 stroke-[3]" />}
              <span className="font-mono">{data.totalDailyChange >= 0 ? '+' : ''}${data.totalDailyChange.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="text-xs opacity-90 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 font-mono">
                {data.totalDailyChange >= 0 ? '+' : ''}{data.totalDailyChangePercent.toFixed(2)}% Today
              </span>
            </div>
          </DashboardCard>

          {/* Holdings Table */}
          <div>
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Underlying Assets</h2>
            <div className="bg-[#090d16]/80 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-black/40 text-[11px] font-bold uppercase tracking-wider text-zinc-400 border-b border-white/5">
                      <th className="p-4 pl-6">Asset</th>
                      <th className="p-4">Shares</th>
                      <th className="p-4">Unit Price</th>
                      <th className="p-4">Total Position Value</th>
                      <th className="p-4 pr-6">Today's P&L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs font-semibold">
                    {data.assets.map((asset) => (
                      <tr key={asset.ticker} className="hover:bg-white/[0.03] transition-colors">
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                             <span className="font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md font-mono">{asset.ticker}</span>
                             <span className="text-zinc-300">{asset.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-zinc-300 font-mono">{asset.shares}</td>
                        <td className="p-4 text-white font-mono">${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="p-4 text-white font-bold font-mono">${asset.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className={`p-4 pr-6 font-bold ${asset.dailyChangePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1 font-mono">
                              {asset.dailyChangePercent >= 0 ? <ArrowUpRight className="h-3.5 w-3.5 stroke-[3]" /> : <ArrowDownRight className="h-3.5 w-3.5 stroke-[3]" />}
                              {asset.dailyChangePercent >= 0 ? '+' : ''}{asset.dailyChangePercent.toFixed(2)}%
                            </div>
                            <div className="text-[10px] opacity-70 font-mono">
                              {asset.dailyChange >= 0 ? '+' : ''}${asset.dailyChange.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {data.assets.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-zinc-500">
                          <div className="flex flex-col items-center justify-center">
                            <BookMarked className="h-10 w-10 text-zinc-600 mb-3 stroke-[1.5]" />
                            <p className="text-sm font-bold text-zinc-300">No Assets Tracked</p>
                            <p className="text-xs text-zinc-500 mt-1">Add items to your watchlist to generate simulated portfolio telemetry.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
