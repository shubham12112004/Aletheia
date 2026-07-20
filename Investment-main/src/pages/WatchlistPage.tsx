import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getWatchlist } from '@/lib/api';
import { DashboardCard } from '@/components/dashboard/DashboardCard';

export function WatchlistPage() {
  const { token } = useAuth();
  const [watchlistItems, setWatchlistItems] = useState<Array<{ ticker: string; name: string }>>([]);

  useEffect(() => {
    if (token) {
      getWatchlist(token).then(setWatchlistItems).catch(console.error);
    }
  }, [token]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-black text-zinc-100 mb-6">Your Watchlist</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {watchlistItems.length > 0 ? (
          watchlistItems.map((item) => (
            <DashboardCard key={item.ticker} className="p-5 border-border/40 shadow-sm">
              <div className="font-black text-xl text-zinc-200">{item.ticker}</div>
              <div className="text-sm font-semibold text-zinc-400">{item.name}</div>
            </DashboardCard>
          ))
        ) : (
          <p className="text-zinc-500">Your watchlist is empty.</p>
        )}
      </div>
    </div>
  );
}
