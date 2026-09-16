import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { SectionTitle } from './SharedSettings';
import { useSettings } from '@/hooks/useSettings';
import { profileSchema } from '@/lib/validations/settings';
import { useAuth } from '@/context/AuthContext';
import { z } from 'zod';

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileSettings({ profileData }: { profileData: any }) {
  const { user } = useAuth();
  const { updateProfile } = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      bio: profileData?.bio || '',
      company: profileData?.company || '',
      occupation: profileData?.occupation || '',
      country: profileData?.country || '',
      timezone: profileData?.timezone || 'UTC',
    }
  });

  const onSubmit = (data: ProfileFormValues) => {
    updateProfile.mutate(data);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          // Send picture via updateProfile mutation
          updateProfile.mutate({ ...handleSubmit(() => {})(), picture: event.target.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const initials = (user?.name || 'AI').split(' ').map((i) => i[0]).slice(0, 2).join('').toUpperCase();

  return (
    <DashboardCard>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-5">
        <SectionTitle title="Account Identity" subtitle="Manage your workspace profile details" />
        <span className="text-xs font-semibold text-zinc-500 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
          Identity Provider: <span className="text-emerald-400 font-bold">{user?.provider === 'google' ? 'Google Auth' : 'Email Credentials'}</span>
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-5 bg-white/3 border border-white/5 p-5 rounded-2xl mb-6">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          {user?.picture ? (
            <img src={user.picture} alt="Avatar" className="h-24 w-24 rounded-full object-cover border-2 border-emerald-400/40 shadow-lg shadow-emerald-500/10" />
          ) : (
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-black text-3xl border-2 border-emerald-400/40 shadow-lg shadow-emerald-500/10">
              {initials}
            </div>
          )}
          <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-[10px] font-bold text-white">
            <Camera className="h-4 w-4 mb-1" />
            Upload
          </div>
          <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileUpload} className="hidden" />
        </div>
        <div className="text-center sm:text-left min-w-0">
          <h4 className="text-lg font-black text-white">{user?.name || 'Workspace Analyst'}</h4>
          <p className="text-sm text-zinc-500 truncate">{user?.email}</p>
          <p className="text-[10px] text-zinc-500 font-semibold mt-1">Click image to upload photo</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5 sm:grid-cols-2">
        <motion.div className="sm:col-span-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">Full Name</label>
          <Input {...register('name')} placeholder="Your full name" className="h-11 rounded-lg border-white/10 bg-white/5 text-white placeholder:text-zinc-600 focus-visible:border-emerald-500/50 focus-visible:ring-2 focus-visible:ring-emerald-500/20" />
          {errors.name && <p className="mt-1.5 text-xs text-rose-400 font-medium">{errors.name.message}</p>}
        </motion.div>
        
        <motion.div className="sm:col-span-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">Email Address</label>
          <Input type="email" {...register('email')} placeholder="your.email@example.com" className="h-11 rounded-lg border-white/10 bg-white/5 text-white placeholder:text-zinc-600 focus-visible:border-emerald-500/50 focus-visible:ring-2 focus-visible:ring-emerald-500/20" />
          {errors.email && <p className="mt-1.5 text-xs text-rose-400 font-medium">{errors.email.message}</p>}
        </motion.div>
        
        <motion.div className="sm:col-span-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">Bio</label>
          <Input {...register('bio')} placeholder="Your professional bio" className="h-11 rounded-lg border-white/10 bg-white/5 text-white placeholder:text-zinc-600 focus-visible:border-emerald-500/50 focus-visible:ring-2 focus-visible:ring-emerald-500/20" />
        </motion.div>
        
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">Company</label>
          <Input {...register('company')} placeholder="Company name" className="h-11 rounded-lg border-white/10 bg-white/5 text-white placeholder:text-zinc-600 focus-visible:border-emerald-500/50 focus-visible:ring-2 focus-visible:ring-emerald-500/20" />
        </motion.div>
        
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">Occupation</label>
          <Input {...register('occupation')} placeholder="Your role" className="h-11 rounded-lg border-white/10 bg-white/5 text-white placeholder:text-zinc-600 focus-visible:border-emerald-500/50 focus-visible:ring-2 focus-visible:ring-emerald-500/20" />
        </motion.div>
        
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">Country</label>
          <Input {...register('country')} placeholder="Your country" className="h-11 rounded-lg border-white/10 bg-white/5 text-white placeholder:text-zinc-600 focus-visible:border-emerald-500/50 focus-visible:ring-2 focus-visible:ring-emerald-500/20" />
        </motion.div>
        
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">Timezone</label>
          <Input {...register('timezone')} placeholder="UTC" className="h-11 rounded-lg border-white/10 bg-white/5 text-white placeholder:text-zinc-600 focus-visible:border-emerald-500/50 focus-visible:ring-2 focus-visible:ring-emerald-500/20" />
        </motion.div>
        
        <motion.div className="sm:col-span-2 mt-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <Button 
            type="submit" 
            disabled={isSubmitting || updateProfile.isPending} 
            className="w-full h-11 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 font-bold text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-500 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {updateProfile.isPending ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Saving Profile...
              </>
            ) : updateProfile.isSuccess ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Profile Saved
              </>
            ) : (
              'Save Profile Changes'
            )}
          </Button>
        </motion.div>
      </form>
    </DashboardCard>
  );
}
