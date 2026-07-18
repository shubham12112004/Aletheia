import { motion } from 'framer-motion';
import { ProfileSettings } from './ProfileSettings';
import { PasswordSettings } from './PasswordSettings';
import { PreferencesSettings } from './PreferencesSettings';
import { ApiKeysSettings } from './ApiKeysSettings';
import { AccountSettings } from './AccountSettings';
import { useSettings } from '@/hooks/useSettings';
import { useAuth } from '@/context/AuthContext';

export function SettingsLayout({ initialView = 'profile' }: { initialView?: 'profile' | 'settings' }) {
  const { query } = useSettings();
  const { user } = useAuth();

  if (query.isPending) {
    return (
      <div className="grid gap-6 lg:grid-cols-3 animate-pulse">
        <div className="h-64 rounded-3xl bg-white/5 lg:col-span-2"></div>
        <div className="h-64 rounded-3xl bg-white/5"></div>
        <div className="h-64 rounded-3xl bg-white/5 lg:col-span-3"></div>
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center text-red-400">
        <p>Failed to load settings. Please try again.</p>
      </div>
    );
  }

  const settings = query.data?.settings;

  // We can combine all the panes into a single scrolling view 
  // since the user wants the exact same UI as the original prototype.
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="grid gap-6 lg:grid-cols-3"
    >
      {/* Left Column (Profile & Password takes 2 cols usually) */}
      <div className="lg:col-span-2 space-y-6">
        <ProfileSettings profileData={settings?.profile} />
        {user?.provider !== 'google' && <PasswordSettings />}
        <AccountSettings />
      </div>

      {/* Right Column (Preferences & API Keys) */}
      <div className="lg:col-span-1 space-y-6">
        <PreferencesSettings settings={settings} />
        <ApiKeysSettings apiKeys={settings?.apiKeys} />
      </div>
    </motion.div>
  );
}
