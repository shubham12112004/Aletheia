import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getWatchlist, addToWatchlist, removeFromWatchlist } from '@/lib/api';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { BookMarked, Pin, Trash2, Search, ArrowUpDown, Plus, Loader2 } from 'lucide-react';
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
          {filteredAndSorted.map(item => (
            <DashboardCard key={item.ticker} className={`p-5 border-border/40 bg-[#09090b] shadow-sm flex justify-between items-start transition-all ${item.isPinned ? 'border-emerald-500/40 bg-emerald-500/5' : ''}`}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-black text-xl text-zinc-100">{item.ticker}</span>
                  {item.isPinned && <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">Pinned</span>}
                </div>
                <div className="text-sm font-semibold text-zinc-400 truncate max-w-[200px]">{item.name}</div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => togglePin(item.ticker)}
                  className={`p-2 rounded-lg transition-colors ${item.isPinned ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-500 hover:text-zinc-300'}`}
                  title={item.isPinned ? 'Unpin asset' : 'Pin asset'}
                >
                  <Pin className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.ticker)}
                  className="p-2 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Remove from watchlist"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </DashboardCard>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/60 rounded-2xl bg-zinc-900/20">
          <BookMarked className="h-12 w-12 text-zinc-600 mb-4" />
          <h3 className="text-lg font-bold text-zinc-300">Watchlist is Empty</h3>
          <p className="text-zinc-500 max-w-sm mt-1 text-sm">Add tickers above to track your favorite companies in real time.</p>
        </div>
      )}
    </div>
  );
}
