import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { SectionTitle, SettingBlock, SegmentedControl, Toggle } from './SharedSettings';
import { useSettings } from '@/hooks/useSettings';
import { Database, SlidersHorizontal, Globe2 } from 'lucide-react';

export function PreferencesSettings({ settings }: { settings: any }) {
  const { updatePreferences, updateRuntime } = useSettings();

  const handleDepthChange = (val: string) => {
    updatePreferences.mutate({ ...settings.preferences, researchDepth: val });
  };

  const handleFormatChange = (val: string) => {
    updatePreferences.mutate({ ...settings.preferences, defaultReportFormat: val });
  };

  const handleRuntimeToggle = (key: string, val: boolean) => {
    updateRuntime.mutate({ ...settings.runtime, [key]: val });
  };

  return (
    <DashboardCard>
      <div className="mb-5 border-b border-white/5 pb-4">
        <SectionTitle title="Workspace Configuration" subtitle="Configure integration endpoints and processing parameters" />
      </div>
      <div className="space-y-4">
        
        <SettingBlock icon={Globe2} title="Active Network Endpoint" subtitle="Switch between production and staging environments">
          <SegmentedControl 
            value="production" // hardcoded visually as per original UI 
            options={[['production', 'Production'], ['staging', 'Staging']]} 
            onChange={() => {}} 
          />
        </SettingBlock>

        <SettingBlock icon={Database} title="Analysis Depth" subtitle="Control agent execution scope and depth">
          <SegmentedControl 
            value={settings?.preferences?.researchDepth || 'standard'} 
            options={[['quick', 'Quick'], ['standard', 'Standard'], ['deep', 'Deep']]} 
            onChange={handleDepthChange} 
          />
        </SettingBlock>

        <SettingBlock icon={Database} title="Report Format" subtitle="Default export format for completed research">
          <SegmentedControl 
            value={settings?.preferences?.defaultReportFormat || 'executive'} 
            options={[['executive', 'Executive'], ['detailed', 'Detailed']]} 
            onChange={handleFormatChange} 
          />
        </SettingBlock>

        <SettingBlock icon={SlidersHorizontal} title="Runtime Options" subtitle="Manage interface updates and state tracking">
          <div className="grid gap-3 sm:grid-cols-2">
            <Toggle label="Socket streaming progress" checked={!!settings?.runtime?.socketStreaming} onChange={(v) => handleRuntimeToggle('socketStreaming', v)} />
            <Toggle label="Quota usage alerts" checked={!!settings?.runtime?.quotaAlerts} onChange={(v) => handleRuntimeToggle('quotaAlerts', v)} />
            <Toggle label="Cache results" checked={!!settings?.runtime?.cacheResults} onChange={(v) => handleRuntimeToggle('cacheResults', v)} />
            <Toggle label="Parallel agents" checked={!!settings?.runtime?.parallelAgents} onChange={(v) => handleRuntimeToggle('parallelAgents', v)} />
          </div>
        </SettingBlock>

        <SettingBlock icon={SlidersHorizontal} title="Display & Language" subtitle="Customize your workspace aesthetics and localization">
          <div className="grid gap-3 sm:grid-cols-2 mb-4">
            <SegmentedControl 
              value="dark" 
              options={[['dark', 'Dark Theme (Active)'], ['light', 'Light Theme (Disabled)']]} 
              onChange={() => {}} 
            />
            <SegmentedControl 
              value="en" 
              options={[['en', 'English'], ['fr', 'Français'], ['es', 'Español']]} 
              onChange={() => {}} 
            />
          </div>
        </SettingBlock>

        <SettingBlock icon={Database} title="Privacy & Notifications" subtitle="Manage your communications and telemetry">
          <div className="grid gap-3 sm:grid-cols-2">
            <Toggle label="Email notifications" checked={true} onChange={() => {}} />
            <Toggle label="Market alerts (Push)" checked={true} onChange={() => {}} />
            <Toggle label="Share anonymous telemetry" checked={false} onChange={() => {}} />
            <Toggle label="Enhanced privacy mode" checked={true} onChange={() => {}} />
          </div>
        </SettingBlock>

      </div>
    </DashboardCard>
  );
}
