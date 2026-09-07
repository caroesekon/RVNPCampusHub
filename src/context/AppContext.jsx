import { createContext, useContext, useState, useEffect } from 'react';
import publicApi from '../api/publicApi.js';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [appSettings, setAppSettings] = useState(null);
  const [campuses, setCampuses] = useState([]);
  const [legals, setLegals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppData();
  }, []);

  const fetchAppData = async () => {
    try {
      const [settingsRes, campusesRes, legalsRes] = await Promise.all([
        publicApi.getSettings(),
        publicApi.getCampuses(),
        publicApi.getLegals(),
      ]);

      if (settingsRes.data.success) {
        setAppSettings(settingsRes.data.data);
        document.title = settingsRes.data.data.appName || 'RVNP Campus Hub';

        if (settingsRes.data.data.faviconUrl) {
          const link = document.querySelector("link[rel='icon']") || document.createElement('link');
          link.rel = 'icon';
          link.href = settingsRes.data.data.faviconUrl;
          document.head.appendChild(link);
        }
      }

      if (campusesRes.data.success) {
        setCampuses(campusesRes.data.data);
      }

      if (legalsRes.data.success) {
        setLegals(legalsRes.data.data);
      }
    } catch (error) {
      console.error('Failed to load app data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const getCampusById = (id) => {
    return campuses.find((campus) => campus.id === id) || null;
  };

  return (
    <AppContext.Provider
      value={{
        appSettings,
        campuses,
        legals,
        loading,
        fetchAppData,
        getCampusById,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};