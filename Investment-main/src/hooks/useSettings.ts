import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import * as api from '@/lib/settingsApi';

export const SETTINGS_QUERY_KEY = ['user-settings'];

export function useSettings() {
  const { token, updateUser, logout } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: () => api.getSettings(token),
    enabled: !!token,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });

  const updateProfile = useMutation({
    mutationFn: (data: unknown) => api.updateProfile(data, token),
    onSuccess: (data) => {
      // Update global user context immediately for avatar/name changes
      if (data?.profile?.name || data?.email) {
        updateUser({ name: data.name, email: data.email });
      }
      toast.success('Profile updated successfully');
      invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const updatePassword = useMutation({
    mutationFn: (data: unknown) => api.updatePassword(data, token),
    onSuccess: () => {
      toast.success('Password updated successfully. You must log in again on other devices.');
      invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateWorkspace = useMutation({
    mutationFn: (data: unknown) => api.updateWorkspace(data, token),
    onSuccess: () => {
      toast.success('Workspace settings updated');
      invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const updatePreferences = useMutation({
    mutationFn: (data: unknown) => api.updatePreferences(data, token),
    onSuccess: () => {
      toast.success('Preferences updated');
      invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateNotifications = useMutation({
    mutationFn: (data: unknown) => api.updateNotifications(data, token),
    onSuccess: () => {
      toast.success('Notification settings saved');
      invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateTheme = useMutation({
    mutationFn: (data: unknown) => api.updateTheme(data, token),
    onSuccess: () => {
      toast.success('Theme preference saved');
      invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateSecurity = useMutation({
    mutationFn: (data: unknown) => api.updateSecurity(data, token),
    onSuccess: () => {
      toast.success('Security settings updated');
      invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateApiKeys = useMutation({
    mutationFn: (data: unknown) => api.updateApiKeys(data, token),
    onSuccess: () => {
      toast.success('API keys saved securely');
      invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateRuntime = useMutation({
    mutationFn: (data: unknown) => api.updateRuntime(data, token),
    onSuccess: () => {
      toast.success('Runtime options updated');
      invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateAnalysis = useMutation({
    mutationFn: (data: unknown) => api.updateAnalysis(data, token),
    onSuccess: () => {
      toast.success('Analysis settings updated');
      invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteAccount = useMutation({
    mutationFn: () => api.deleteAccount(token),
    onSuccess: () => {
      toast.success('Account deleted successfully');
      logout();
    },
    onError: (err) => toast.error(err.message),
  });

  return {
    query,
    updateProfile,
    updatePassword,
    updateWorkspace,
    updatePreferences,
    updateNotifications,
    updateTheme,
    updateSecurity,
    updateApiKeys,
    updateRuntime,
    updateAnalysis,
    deleteAccount,
  };
}
