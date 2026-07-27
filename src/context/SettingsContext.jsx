import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSiteConfig, getSiteToggles } from '@/api/site';

const SettingsContext = createContext();

const defaultSettings = {
  systemName: 'RVNP Campus Hub',
  tagline: 'The Digital Quad of Rift Valley National Polytechnic',
  supportEmail: 'support@hdm.com',
  supportPhone: '',
  logo: '',
  favicon: '',
  language: 'en',
  timezone: 'Africa/Nairobi',
  downloads: {},
  uploads: {},
  limits: {},
  toggles: {
    userRegistration: true,
    posts: true,
    stories: true,
    chat: true,
    groups: true,
    marketplace: true,
    verification: true,
    leaderboard: true,
    live: true,
    maintenanceMode: false,
    betaFeatures: false,
    ai: {
      aiEnabled: true,
      chatEnabled: true,
      moderationEnabled: true,
      smartFeedEnabled: true,
      suggestedRepliesEnabled: true,
      trendingEnabled: true,
    },
  },
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      const [configRes, togglesRes] = await Promise.all([
        getSiteConfig(),
        getSiteToggles(),
      ]);
      setSettings(prev => ({
        ...prev,
        systemName: configRes.data?.systemName || prev.systemName,
        tagline: configRes.data?.tagline || prev.tagline,
        supportEmail: configRes.data?.supportEmail || prev.supportEmail,
        supportPhone: configRes.data?.supportPhone || prev.supportPhone,
        logo: configRes.data?.logo || prev.logo,
        downloads: configRes.data?.downloads || prev.downloads,
        uploads: configRes.data?.uploads || prev.uploads,
        limits: configRes.data?.limits || prev.limits,
        toggles: togglesRes.data || prev.toggles,
      }));
    } catch {
      // Use defaults on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    // Refetch every 2 minutes to catch admin changes
    const interval = setInterval(fetchSettings, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchSettings]);

  const isFeatureEnabled = (feature) => {
    return settings.toggles?.[feature] !== false;
  };

  const isAIEnabled = (feature) => {
    if (!settings.toggles?.ai?.aiEnabled) return false;
    if (feature) return settings.toggles?.ai?.[feature] !== false;
    return true;
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      loading,
      isFeatureEnabled,
      isAIEnabled,
      refetch: fetchSettings,
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};