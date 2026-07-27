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
      setSettings({
        ...configRes.data,
        toggles: togglesRes.data,
      });
    } catch {
      // Use defaults on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    const interval = setInterval(fetchSettings, 5 * 60 * 1000);
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