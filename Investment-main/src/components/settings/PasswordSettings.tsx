import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { SectionTitle } from './SharedSettings';
import { useSettings } from '@/hooks/useSettings';
import { passwordSchema } from '@/lib/validations/settings';
import { z } from 'zod';

type PasswordFormValues = z.infer<typeof passwordSchema>;

export function PasswordSettings() {
  const { updatePassword } = useSettings();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = (data: PasswordFormValues) => {
    updatePassword.mutate(data, {
      onSuccess: () => reset()
    });
  };

  return (
    <DashboardCard>
      <div className="mb-5 border-b border-white/5 pb-4">
        <SectionTitle title="Security & Authentication" subtitle="Update local workspace password" />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-zinc-400 mb-1.5">Current password</label>
          <Input type="password" {...register('currentPassword')} className="h-11 border-white/10 bg-white/5 text-white" />
          {errors.currentPassword && <p className="mt-1 text-xs text-red-400">{errors.currentPassword.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-400 mb-1.5">New password</label>
          <Input type="password" {...register('newPassword')} className="h-11 border-white/10 bg-white/5 text-white" />
          {errors.newPassword && <p className="mt-1 text-xs text-red-400">{errors.newPassword.message}</p>}
          <p className="mt-1.5 text-[10px] text-zinc-500">Must be at least 8 characters, with 1 uppercase, 1 lowercase, 1 number, and 1 special character.</p>
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-400 mb-1.5">Confirm new password</label>
          <Input type="password" {...register('confirmPassword')} className="h-11 border-white/10 bg-white/5 text-white" />
          {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p>}
        </div>
        
        <div className="pt-2">
          <Button type="submit" disabled={isSubmitting || updatePassword.isPending} className="rounded-xl border border-white/10 bg-white/5 font-bold text-white hover:bg-white/10">
            {updatePassword.isPending ? 'Updating...' : 'Update Password'}
          </Button>
        </div>
      </form>
    </DashboardCard>
  );
}
