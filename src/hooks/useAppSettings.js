import { useSettings } from '@/context/SettingsContext';

export const useAppSettings = () => {
  const { settings, loading, isFeatureEnabled, isAIEnabled, refetch } = useSettings();

  return {
    systemName: settings.systemName,
    tagline: settings.tagline,
    supportEmail: settings.supportEmail,
    supportPhone: settings.supportPhone,
    toggles: settings.toggles,
    limits: settings.limits,
    uploads: settings.uploads,
    downloads: settings.downloads,
    loading,
    isFeatureEnabled,
    isAIEnabled,
    refetch,
  };
};