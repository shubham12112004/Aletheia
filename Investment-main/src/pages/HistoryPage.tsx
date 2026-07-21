import { useState, useEffect } from 'react';
import { History as HistoryIcon, Loader2, Search } from 'lucide-react';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { RecommendationBadge } from '@/components/dashboard/RecommendationBadge';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchHistory() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/history`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setHistory(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [token]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-black text-zinc-100 mb-6 flex items-center gap-3">
        <HistoryIcon className="h-8 w-8 text-emerald-500" /> Research History
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : history.length > 0 ? (
          history.map(item => (
            <DashboardCard key={item._id} className="p-5 border-border/40 bg-[#09090b] shadow-sm flex flex-col justify-between hover:border-emerald-500/30 transition-all cursor-pointer group" onClick={() => navigate('/app/terminal')}>
              <div>
                <div className="font-black text-zinc-200 mb-1 group-hover:text-emerald-400 transition-colors truncate">{item.company}</div>
                <div className="text-xs text-zinc-500 font-medium flex items-center gap-2 mb-4">
                  <span className="font-bold text-zinc-400">{item.ticker}</span>
                  <span>•</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="self-end">
                <RecommendationBadge verdict={item.finalReport?.verdict || "HOLD"} />
              </div>
            </DashboardCard>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/60 rounded-xl bg-zinc-900/20">
            <Search className="h-12 w-12 text-zinc-600 mb-4" />
            <h3 className="text-lg font-bold text-zinc-300">No Research History</h3>
            <p className="text-zinc-500 max-w-sm mt-2">You haven't run any AI research yet. Head over to the terminal to analyze your first stock.</p>
          </div>
        )}
      </div>
    </div>
  );
}
