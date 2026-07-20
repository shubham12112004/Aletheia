import { useState, useEffect } from 'react';
import { History as HistoryIcon } from 'lucide-react';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { RecommendationBadge } from '@/components/dashboard/RecommendationBadge';

export function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('alethia.researchHistory');
      if (stored) setHistory(JSON.parse(stored));
    } catch {
      setHistory([]);
    }
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-black text-zinc-100 mb-6 flex items-center gap-3">
        <HistoryIcon className="h-8 w-8 text-emerald-500" /> Research History
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {history.length > 0 ? (
          history.map(item => (
            <DashboardCard key={item.id} className="p-5 border-border/40 bg-[#09090b] shadow-sm flex flex-col justify-between">
              <div>
                <div className="font-black text-zinc-200 mb-1">{item.company}</div>
                <div className="text-xs text-zinc-500 font-medium flex items-center gap-2 mb-4">
                  <span className="font-bold text-zinc-400">{item.ticker}</span>
                  <span>•</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="self-end">
                <RecommendationBadge verdict={item.result.verdict} />
              </div>
            </DashboardCard>
          ))
        ) : (
          <p className="text-zinc-500">No recent research history.</p>
        )}
      </div>
    </div>
  );
}
