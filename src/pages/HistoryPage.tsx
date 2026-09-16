import { useState, useEffect, useMemo } from 'react';
import { History as HistoryIcon, Loader2, Search, Star, Trash2, Edit2, Download, FileText, X } from 'lucide-react';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { RecommendationBadge } from '@/components/dashboard/RecommendationBadge';
import { StructuredReport } from '@/components/dashboard/StructuredReport';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type HistoryItem = {
  _id: string;
  company: string;
  ticker: string;
  createdAt: string;
  finalReport?: any;
  isFavorite?: boolean;
};

export function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<HistoryItem | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const { token } = useAuth();

  const fetchHistory = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setHistory(data.data || []);
      }
    } catch (err) {
      toast.error('Failed to fetch research history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [token]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/history/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Report deleted');
      setHistory(prev => prev.filter(h => h._id !== id));
      if (selectedReport?._id === id) setSelectedReport(null);
    } catch (err) {
      toast.error('Failed to delete report');
    }
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory(prev =>
      prev.map(h => (h._id === id ? { ...h, isFavorite: !h.isFavorite } : h))
    );
    toast.success('Updated favorite');
  };

  const startRename = (item: HistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(item._id);
    setEditTitle(item.company);
  };

  const saveRename = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    setHistory(prev =>
      prev.map(h => (h._id === id ? { ...h, company: editTitle.trim() } : h))
    );
    setEditingId(null);
    toast.success('Report renamed');
  };

  const handleExport = (item: HistoryItem, format: 'json' | 'md', e: React.MouseEvent) => {
    e.stopPropagation();
    const dataStr = format === 'json'
      ? JSON.stringify(item.finalReport, null, 2)
      : `# Research Report: ${item.company} (${item.ticker})\n\n` + JSON.stringify(item.finalReport, null, 2);

    const blob = new Blob([dataStr], { type: format === 'json' ? 'application/json' : 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${item.ticker}_Research_Report.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported as ${format.toUpperCase()}`);
  };

  const filtered = useMemo(() => {
    return history.filter(
      h =>
        h.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.ticker.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [history, searchQuery]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <HistoryIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-zinc-100 tracking-tight">Research History</h1>
            <p className="text-zinc-400 font-medium mt-1">Review, rename, favorite, and export past AI evaluation reports</p>
          </div>
        </div>

        {/* Filter Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search reports..."
            className="pl-9 bg-zinc-900 border-border/60 h-10 text-sm text-white"
          />
        </div>
      </div>

      {/* History Grid */}
      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => (
            <DashboardCard
              key={item._id}
              onClick={() => setSelectedReport(item)}
              className={`p-5 border-border/40 bg-[#09090b] shadow-sm flex flex-col justify-between hover:border-emerald-500/30 transition-all cursor-pointer group ${
                item.isFavorite ? 'border-amber-500/40 bg-amber-500/5' : ''
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  {editingId === item._id ? (
                    <form onSubmit={e => saveRename(item._id, e)} onClick={e => e.stopPropagation()} className="flex items-center gap-1">
                      <Input
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        className="h-8 text-xs font-bold bg-zinc-900 border-emerald-500 text-white"
                        autoFocus
                      />
                      <Button type="submit" size="sm" className="h-8 px-2 bg-emerald-500 text-xs">Save</Button>
                    </form>
                  ) : (
                    <div className="font-black text-lg text-zinc-200 group-hover:text-emerald-400 transition-colors truncate max-w-[200px]">
                      {item.company}
                    </div>
                  )}

                  <button
                    onClick={e => toggleFavorite(item._id, e)}
                    className={`p-1 rounded-md transition-colors ${item.isFavorite ? 'text-amber-400' : 'text-zinc-600 hover:text-amber-400'}`}
                  >
                    <Star className="h-4 w-4 fill-current" />
                  </button>
                </div>

                <div className="text-xs text-zinc-500 font-medium flex items-center gap-2 mb-4">
                  <span className="font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">{item.ticker}</span>
                  <span>•</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/20">
                <RecommendationBadge verdict={item.finalReport?.verdict || 'PASS'} />

                <div className="flex items-center gap-1">
                  <button
                    onClick={e => startRename(item, e)}
                    className="p-1.5 text-zinc-500 hover:text-zinc-200 transition-colors"
                    title="Rename"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={e => handleExport(item, 'json', e)}
                    className="p-1.5 text-zinc-500 hover:text-emerald-400 transition-colors"
                    title="Export JSON"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={e => handleDelete(item._id, e)}
                    className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </DashboardCard>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/60 rounded-2xl bg-zinc-900/20">
          <Search className="h-12 w-12 text-zinc-600 mb-4" />
          <h3 className="text-lg font-bold text-zinc-300">No Research Reports</h3>
          <p className="text-zinc-500 max-w-sm mt-1 text-sm">Analyze stocks in the Terminal to automatically store institutional AI reports here.</p>
        </div>
      )}

      {/* Modal for viewing full structured report */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#09090b] border border-border/60 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 relative shadow-2xl">
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-white bg-zinc-900 rounded-full border border-border/40"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-border/40 pb-4">
              <FileText className="h-6 w-6 text-emerald-500" />
              <div>
                <h2 className="text-2xl font-black text-white">{selectedReport.company} ({selectedReport.ticker})</h2>
                <p className="text-xs text-zinc-400">Generated on {new Date(selectedReport.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <StructuredReport data={selectedReport.finalReport || {}} />

            <div className="flex justify-end gap-3 border-t border-border/40 pt-4">
              <Button
                variant="outline"
                onClick={e => handleExport(selectedReport, 'md', e)}
                className="text-xs font-bold border-border/60"
              >
                Export Markdown
              </Button>
              <Button
                onClick={() => setSelectedReport(null)}
                className="bg-emerald-500 text-white font-bold text-xs"
              >
                Close Report
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
