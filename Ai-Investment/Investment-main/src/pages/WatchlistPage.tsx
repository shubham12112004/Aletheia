import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { getWatchlist, addToWatchlist, removeFromWatchlist } from '@/lib/api';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { BookMarked, Pin, Trash2, Search, ArrowUpDown, Plus, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type WatchlistItem = {
  _id?: string;
  ticker: string;
  name: string;
  isPinned?: boolean;
};

export function WatchlistPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'ticker' | 'name'>('ticker');
  const [sortAsc, setSortAsc] = useState(true);
  const [newTicker, setNewTicker] = useState('');
  const [newName, setNewName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const fetchWatchlist = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await getWatchlist(token);
      setItems(data || []);
    } catch (err) {
      toast.error('Failed to load watchlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, [token]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicker.trim() || !token) return;
    try {
      setIsAdding(true);
      await addToWatchlist({ ticker: newTicker.toUpperCase().trim(), name: newName.trim() || newTicker.toUpperCase().trim() }, token);
      toast.success(`Added ${newTicker.toUpperCase()} to watchlist`);
      setNewTicker('');
      setNewName('');
      await fetchWatchlist();
    } catch (err) {
      toast.error('Failed to add ticker');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (ticker: string) => {
    if (!token) return;
    try {
      await removeFromWatchlist(ticker, token);
      toast.success(`Removed ${ticker} from watchlist`);
      setItems(prev => prev.filter(i => i.ticker !== ticker));
    } catch (err) {
      toast.error('Failed to remove ticker');
    }
  };

  const togglePin = (ticker: string) => {
    setItems(prev =>
      prev.map(i => (i.ticker === ticker ? { ...i, isPinned: !i.isPinned } : i))
    );
  };

  const filteredAndSorted = useMemo(() => {
    let result = items.filter(
      i =>
        i.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    result.sort((a, b) => {
      // Pinned items first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      const fieldA = a[sortField].toLowerCase();
      const fieldB = b[sortField].toLowerCase();
      if (fieldA < fieldB) return sortAsc ? -1 : 1;
      if (fieldA > fieldB) return sortAsc ? 1 : -1;
      return 0;
    });

    return result;
  }, [items, searchQuery, sortField, sortAsc]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <BookMarked className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-zinc-100 tracking-tight">Active Watchlist</h1>
            <p className="text-zinc-400 font-medium mt-1">Track and organize your primary equity assets</p>
          </div>
        </div>

        {/* Add Ticker Inline Form */}
        <form onSubmit={handleAdd} className="flex gap-2">
          <Input
            value={newTicker}
            onChange={e => setNewTicker(e.target.value)}
            placeholder="Ticker (e.g. NVDA)"
            className="w-32 bg-zinc-900 border-border/60 h-10 font-bold uppercase text-white"
          />
          <Input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Company Name"
            className="w-44 bg-zinc-900 border-border/60 h-10 text-white hidden sm:block"
          />
          <Button type="submit" disabled={isAdding || !newTicker.trim()} className="bg-emerald-500 hover:bg-emerald-600 font-bold h-10 px-4">
            {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-1" /> Add</>}
          </Button>
        </form>
      </div>

      {/* Toolbar: Search & Sorting */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900/40 p-4 rounded-xl border border-border/40">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Filter by ticker or name..."
            className="pl-9 bg-zinc-900 border-border/60 h-9 text-sm text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (sortField === 'ticker') setSortAsc(!sortAsc);
              else {
                setSortField('ticker');
                setSortAsc(true);
              }
            }}
            className={`text-xs font-bold ${sortField === 'ticker' ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-400'}`}
          >
            <ArrowUpDown className="h-3.5 w-3.5 mr-1" /> Ticker
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (sortField === 'name') setSortAsc(!sortAsc);
              else {
                setSortField('name');
                setSortAsc(true);
              }
            }}
            className={`text-xs font-bold ${sortField === 'name' ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-400'}`}
          >
            <ArrowUpDown className="h-3.5 w-3.5 mr-1" /> Name
          </Button>
        </div>
      </div>

      {/* Watchlist Items Grid */}
      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : filteredAndSorted.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSorted.map((item, idx) => {
            // Mock price data for demonstration
            const mockPrice = 100 + Math.random() * 300;
            const mockChange = (Math.random() - 0.5) * 10;
            const changePercent = mockChange.toFixed(2);
            const isPositive = mockChange >= 0;
            
            return (
              <motion.div
                key={item.ticker}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <DashboardCard className={`p-5 border-white/10 bg-[#090d16]/70 shadow-md flex flex-col justify-between transition-all group ${item.isPinned ? 'border-emerald-500/40 bg-emerald-500/[0.03] ring-1 ring-emerald-500/20' : 'hover:border-emerald-500/30'}`}>
                  {/* Header: Ticker & Pinned Badge */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-emerald-500/20">
                        {item.ticker.slice(0, 1)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-lg text-white font-mono">{item.ticker}</span>
                          {item.isPinned && (
                            <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                              ★ Pinned
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-semibold text-zinc-400 truncate max-w-[160px]">{item.name}</div>
                      </div>
                    </div>
                  </div>

                  {/* Price & Change Section */}
                  <div className="mb-4 space-y-2">
                    <div className="text-2xl font-black text-white font-mono tracking-tight">
                      ${mockPrice.toFixed(2)}
                    </div>
                    <div className={`flex items-center gap-1.5 text-sm font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPositive ? <TrendingUp className="h-4 w-4 stroke-[2.5]" /> : <TrendingDown className="h-4 w-4 stroke-[2.5]" />}
                      <span>{isPositive ? '+' : ''}{changePercent}%</span>
                      <span className="text-xs text-zinc-500 font-medium">Today</span>
                    </div>
                  </div>

                  {/* Performance Indicator */}
                  <div className="mb-4 h-6 rounded-full bg-black/40 border border-white/5 overflow-hidden flex items-center justify-end pr-1">
                    <div className={`h-full flex-1 rounded-full transition-all ${isPositive ? 'bg-emerald-500/30' : 'bg-rose-500/30'}`} style={{ width: `${Math.abs(mockChange) * 5}%` }} />
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <button
                      onClick={() => handleDelete(item.ticker)}
                      className="text-xs font-bold text-zinc-500 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 flex items-center gap-1"
                      title="Remove from watchlist"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                    <button
                      onClick={() => togglePin(item.ticker)}
                      className={`p-1.5 rounded-lg transition-all ${item.isPinned ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10'}`}
                      title={item.isPinned ? 'Unpin asset' : 'Pin asset'}
                    >
                      <Pin className="h-4 w-4" />
                    </button>
                  </div>
                </DashboardCard>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center p-16 text-center border border-dashed border-white/10 rounded-2xl bg-gradient-to-b from-white/[0.02] to-transparent"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 mb-4 shadow-inner border border-emerald-500/20">
            <BookMarked className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-black text-zinc-100">Watchlist is Empty</h3>
          <p className="text-zinc-400 max-w-sm mt-2 text-sm font-medium">Add tickers above to start tracking your favorite companies in real time</p>
        </motion.div>
      )}
    </div>
  );
}
