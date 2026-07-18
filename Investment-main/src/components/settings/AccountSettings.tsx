import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { SectionTitle } from './SharedSettings';
import { useSettings } from '@/hooks/useSettings';
import { AlertTriangle } from 'lucide-react';

export function AccountSettings() {
  const { deleteAccount } = useSettings();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleExportData = () => {
    // Basic JSON export for now
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ note: "Export feature pending" }));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "aletheia_data.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="space-y-6">
      <DashboardCard>
        <div className="mb-5 border-b border-white/5 pb-4">
          <SectionTitle title="Account Data" subtitle="Export or manage your workspace data" />
        </div>
        <div className="flex flex-col gap-3">
          <Button onClick={handleExportData} variant="outline" className="w-full sm:w-auto self-start border-white/10 text-zinc-300">
            Export My Data (JSON)
          </Button>
        </div>
      </DashboardCard>

      <DashboardCard className="border-red-500/20 bg-red-500/5 hover:border-red-500/30">
        <div className="mb-5 border-b border-red-500/10 pb-4">
          <SectionTitle title="Danger Zone" subtitle="Permanently remove your account and all data" />
        </div>
        {!confirmDelete ? (
          <Button onClick={() => setConfirmDelete(true)} variant="destructive" className="bg-red-500/20 text-red-400 hover:bg-red-500/30">
            Delete Account
          </Button>
        ) : (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <div className="flex items-center gap-2 text-red-400 mb-3">
              <AlertTriangle className="h-5 w-5" />
              <p className="text-sm font-bold">Are you absolutely sure?</p>
            </div>
            <p className="text-xs text-red-400/80 mb-4">
              This action cannot be undone. This will permanently delete your account, workspace data, API keys, and all research history.
            </p>
            <div className="flex items-center gap-3">
              <Button onClick={() => setConfirmDelete(false)} variant="ghost" className="text-zinc-400 hover:text-white">
                Cancel
              </Button>
              <Button onClick={() => deleteAccount.mutate()} disabled={deleteAccount.isPending} variant="destructive" className="bg-red-500 text-white hover:bg-red-600">
                {deleteAccount.isPending ? 'Deleting...' : 'Yes, delete my account'}
              </Button>
            </div>
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
