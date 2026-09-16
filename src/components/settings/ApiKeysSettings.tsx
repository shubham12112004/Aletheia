import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { SectionTitle } from './SharedSettings';
import { useSettings } from '@/hooks/useSettings';
import { apiKeysSchema } from '@/lib/validations/settings';
import { z } from 'zod';

type ApiKeysFormValues = z.infer<typeof apiKeysSchema>;

export function ApiKeysSettings({ apiKeys }: { apiKeys: any }) {
  const { updateApiKeys } = useSettings();
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ApiKeysFormValues>({
    resolver: zodResolver(apiKeysSchema),
    defaultValues: {
      geminiKey: apiKeys?.geminiKey || '',
      newsApiKey: apiKeys?.newsApiKey || '',
      fmpKey: apiKeys?.fmpKey || '',
      tavilyKey: apiKeys?.tavilyKey || '',
    }
  });

  const onSubmit = (data: ApiKeysFormValues) => {
    updateApiKeys.mutate(data);
  };

  const toggleVisibility = (field: string) => {
    setShowKeys((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <DashboardCard>
      <div className="mb-5 border-b border-white/5 pb-4">
        <SectionTitle title="API Integrations" subtitle="Manage external service credentials" />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {['geminiKey', 'newsApiKey', 'fmpKey', 'tavilyKey'].map((field) => (
          <div key={field}>
            <label className="block text-xs font-bold text-zinc-400 mb-1.5 uppercase">
              {field.replace('Key', ' Key')}
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input 
                type={showKeys[field] ? 'text' : 'password'} 
                {...register(field as keyof ApiKeysFormValues)} 
                className="h-11 pl-10 pr-10 border-white/10 bg-white/5 text-white" 
              />
              <button
                type="button"
                onClick={() => toggleVisibility(field)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition"
              >
                {showKeys[field] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors[field as keyof ApiKeysFormValues] && <p className="mt-1 text-xs text-red-400">{errors[field as keyof ApiKeysFormValues]?.message}</p>}
          </div>
        ))}

        <div className="pt-2">
          <Button type="submit" disabled={isSubmitting || updateApiKeys.isPending} className="rounded-xl bg-emerald-500 font-bold text-[#05080f] hover:bg-emerald-400">
            {updateApiKeys.isPending ? 'Saving...' : 'Save API Keys'}
          </Button>
        </div>
      </form>
    </DashboardCard>
  );
}
