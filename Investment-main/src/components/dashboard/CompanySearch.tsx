import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Clock, Sparkles, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type Suggestion = { ticker: string; name: string };

const POPULAR_TICKERS: Suggestion[] = [
  { ticker: 'AAPL', name: 'Apple Inc.' },
  { ticker: 'MSFT', name: 'Microsoft Corporation' },
  { ticker: 'NVDA', name: 'NVIDIA Corporation' },
  { ticker: 'AMZN', name: 'Amazon.com, Inc.' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.' },
  { ticker: 'META', name: 'Meta Platforms, Inc.' },
  { ticker: 'TSLA', name: 'Tesla, Inc.' },
  { ticker: 'AMD', name: 'Advanced Micro Devices' },
];

const SEARCH_HISTORY_KEY = 'aletheia.recentSearches';

export function CompanySearch({ onSearch, disabled }: { onSearch: (query: string) => void; disabled?: boolean }) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load recent searches on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch {
      setRecentSearches([]);
    }
  }, []);

  // Save recent search
  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim().toUpperCase();
    if (!trimmed) return;
    const updated = [trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Debounce input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  // Filter suggestions
  const suggestions = useMemo(() => {
    if (!debouncedQuery) return [];
    const q = debouncedQuery.toUpperCase();
    return POPULAR_TICKERS.filter(
      item => item.ticker.includes(q) || item.name.toUpperCase().includes(q)
    );
  }, [debouncedQuery]);

  // Handle Submit
  const triggerSearch = (targetQuery?: string) => {
    const finalQuery = (targetQuery || query).trim();
    if (!finalQuery || disabled) return;
    saveRecentSearch(finalQuery);
    setIsOpen(false);
    onSearch(finalQuery);
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        triggerSearch(suggestions[selectedIndex].ticker);
      } else {
        triggerSearch();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
        <Input
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. AAPL, Tesla, NVDA..."
          className="w-full bg-[#09090b] border-border/60 pl-14 pr-32 h-16 rounded-2xl text-lg shadow-xl focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50 transition-all placeholder:text-zinc-600 font-semibold"
        />
        <Button
          onClick={() => triggerSearch()}
          disabled={!query.trim() || disabled}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-12 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 font-bold px-8 shadow-md"
        >
          {disabled ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Analyze'}
        </Button>
      </div>

      {/* Dropdown Suggestions & History */}
      {isOpen && (suggestions.length > 0 || recentSearches.length > 0) && (
        <div className="absolute top-full mt-2 inset-x-0 bg-[#09090b]/95 backdrop-blur-xl border border-border/50 rounded-2xl p-3 shadow-2xl z-50 overflow-hidden space-y-3">
          {/* Autocomplete Suggestions */}
          {suggestions.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-3 py-1 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-emerald-500" /> Suggestions
              </div>
              <div className="space-y-1 mt-1">
                {suggestions.map((item, idx) => (
                  <button
                    key={item.ticker}
                    onClick={() => {
                      setQuery(item.ticker);
                      triggerSearch(item.ticker);
                    }}
                    className={`w-full text-left flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      idx === selectedIndex ? 'bg-emerald-500/10 text-emerald-400' : 'hover:bg-zinc-800/60 text-zinc-300'
                    }`}
                  >
                    <span className="font-bold text-white">{item.ticker}</span>
                    <span className="text-zinc-500 text-xs truncate max-w-[250px]">{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-3 py-1 flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-zinc-400" /> Recent Searches
              </div>
              <div className="flex flex-wrap gap-2 px-3 py-2">
                {recentSearches.map(term => (
                  <button
                    key={term}
                    onClick={() => {
                      setQuery(term);
                      triggerSearch(term);
                    }}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg bg-zinc-900 border border-border/40 text-zinc-300 hover:border-emerald-500/40 hover:text-emerald-400 transition-all"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
