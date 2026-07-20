import { useEffect, useState } from 'react';
import { getScreenerData } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { LayoutGrid, Loader2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

type ScreenerData = {
  ticker: string;
  price: number;
  changePercent: number;
  volume: number;
  peRatio: number;
  marketCap: number;
  dividendYield: number;
};

export function ScreenerPage() {
  const { token } = useAuth();
  const [data, setData] = useState<ScreenerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getScreenerData(token);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load screener data');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  const formatNumber = (num: number) => {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    return num.toLocaleString();
  };

  return (
    <div className="flex-1 w-full max-w-[1600px] mx-auto flex flex-col gap-6 relative z-10 p-4 md:p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
          <LayoutGrid className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-zinc-100 tracking-tight">Stock Screener</h1>
          <p className="text-zinc-400 font-medium mt-1">Discover trending assets and metrics</p>
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
        <div className="bg-zinc-900/40 border border-border/40 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900/60 text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-border/40">
                  <th className="p-4 pl-6">Ticker</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">24h Change</th>
                  <th className="p-4">Volume</th>
                  <th className="p-4">P/E Ratio</th>
                  <th className="p-4">Market Cap</th>
                  <th className="p-4 pr-6">Div Yield</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20 text-sm font-medium">
                {data.map((row) => (
                  <tr key={row.ticker} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="p-4 pl-6">
                      <span className="font-bold text-zinc-100 bg-zinc-800/50 px-2 py-1 rounded">{row.ticker}</span>
                    </td>
                    <td className="p-4 text-zinc-100">${row.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className={`p-4 font-bold ${row.changePercent >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      <div className="flex items-center gap-1">
                        {row.changePercent >= 0 ? <ArrowUpRight className="h-3 w-3 stroke-[3]" /> : <ArrowDownRight className="h-3 w-3 stroke-[3]" />}
                        {row.changePercent >= 0 ? '+' : ''}{row.changePercent.toFixed(2)}%
                      </div>
                    </td>
                    <td className="p-4 text-zinc-300">{formatNumber(row.volume)}</td>
                    <td className="p-4 text-zinc-300">{row.peRatio ? row.peRatio.toFixed(2) : '--'}</td>
                    <td className="p-4 text-zinc-300">${formatNumber(row.marketCap)}</td>
                    <td className="p-4 pr-6 text-zinc-300">{row.dividendYield ? `${row.dividendYield.toFixed(2)}%` : '--'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
