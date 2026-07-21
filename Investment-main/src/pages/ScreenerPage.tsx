import { useEffect, useState, useMemo } from 'react';
import { getScreenerData } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { LayoutGrid, ArrowUpRight, ArrowDownRight, Search, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'ticker' | 'price' | 'changePercent' | 'marketCap'>('marketCap');
  const [sortAsc, setSortAsc] = useState(false);

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

  const filteredAndSorted = useMemo(() => {
    let result = data.filter(item =>
      item.ticker.toLowerCase().includes(searchQuery.toLowerCase())
    );

    result.sort((a, b) => {
      let valA = a[sortField] || 0;
      let valB = b[sortField] || 0;
      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB as string) : (valB as string).localeCompare(valA);
      }
      return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });

    return result;
  }, [data, searchQuery, sortField, sortAsc]);

  const toggleSort = (field: 'ticker' | 'price' | 'changePercent' | 'marketCap') => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="flex-1 w-full max-w-[1600px] mx-auto flex flex-col gap-6 relative z-10 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
            <LayoutGrid className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Institutional Stock Screener</h1>
            <p className="text-xs text-zinc-400 font-medium mt-1">Filter and benchmark assets by fundamental ratio metrics</p>
          </div>
        </div>

        {/* Filter Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by ticker..."
            className="pl-9 bg-[#090d16] border-white/10 h-10 text-xs text-white rounded-xl"
          />
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-[#090d16]/70 p-6 space-y-4 animate-pulse">
          <div className="h-8 w-full bg-white/10 rounded-lg" />
          <div className="h-12 w-full bg-white/10 rounded-lg" />
          <div className="h-12 w-full bg-white/10 rounded-lg" />
          <div className="h-12 w-full bg-white/10 rounded-lg" />
        </div>
      ) : error ? (
        <div className="text-rose-400 bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl font-bold text-xs">
          {error}
        </div>
      ) : (
        <div className="bg-[#090d16]/80 border border-white/10 rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/40 text-[11px] font-bold uppercase tracking-wider text-zinc-400 border-b border-white/5">
                  <th className="p-4 pl-6 cursor-pointer hover:text-white" onClick={() => toggleSort('ticker')}>
                    <div className="flex items-center gap-1">Ticker <ArrowUpDown className="h-3 w-3" /></div>
                  </th>
                  <th className="p-4 cursor-pointer hover:text-white" onClick={() => toggleSort('price')}>
                    <div className="flex items-center gap-1">Price <ArrowUpDown className="h-3 w-3" /></div>
                  </th>
                  <th className="p-4 cursor-pointer hover:text-white" onClick={() => toggleSort('changePercent')}>
                    <div className="flex items-center gap-1">24h Change <ArrowUpDown className="h-3 w-3" /></div>
                  </th>
                  <th className="p-4">Volume</th>
                  <th className="p-4">P/E Ratio</th>
                  <th className="p-4 cursor-pointer hover:text-white" onClick={() => toggleSort('marketCap')}>
                    <div className="flex items-center gap-1">Market Cap <ArrowUpDown className="h-3 w-3" /></div>
                  </th>
                  <th className="p-4 pr-6">Div Yield</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs font-semibold">
                {filteredAndSorted.map((row) => (
                  <tr key={row.ticker} className="hover:bg-white/[0.03] transition-colors">
                    <td className="p-4 pl-6">
                      <span className="font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md font-mono">{row.ticker}</span>
                    </td>
                    <td className="p-4 text-white font-mono">${row.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className={`p-4 font-bold ${row.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      <div className="flex items-center gap-1">
                        {row.changePercent >= 0 ? <ArrowUpRight className="h-3.5 w-3.5 stroke-[3]" /> : <ArrowDownRight className="h-3.5 w-3.5 stroke-[3]" />}
                        {row.changePercent >= 0 ? '+' : ''}{row.changePercent.toFixed(2)}%
                      </div>
                    </td>
                    <td className="p-4 text-zinc-300 font-mono">{formatNumber(row.volume)}</td>
                    <td className="p-4 text-zinc-300 font-mono">{row.peRatio ? row.peRatio.toFixed(2) : '--'}</td>
                    <td className="p-4 text-zinc-300 font-mono">${formatNumber(row.marketCap)}</td>
                    <td className="p-4 pr-6 text-zinc-300 font-mono">{row.dividendYield ? `${row.dividendYield.toFixed(2)}%` : '--'}</td>
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
