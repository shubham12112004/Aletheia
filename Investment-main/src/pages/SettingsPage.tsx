import { Settings as SettingsIcon } from 'lucide-react';
import { SettingsLayout } from '@/components/settings/SettingsLayout';

export function SettingsPage() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 shadow-inner">
          <SettingsIcon className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white">Platform Settings</h2>
          <p className="text-sm text-zinc-400 font-medium mt-1">Manage your workspace preferences, identity, and security</p>
        </div>
      </div>
      
      <div className="rounded-3xl border border-white/5 bg-[#05080f] p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
        <SettingsLayout />
      </div>
    </div>
  );
}
