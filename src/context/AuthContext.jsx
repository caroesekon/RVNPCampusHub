import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getMe,
  refreshToken as apiRefreshToken,
} from '@/api/auth';
import { storage } from '@/utils/storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const extractUser = (res) => {
    if (!res) return null;
    return res.data?.user || res.data?.admin || res.user || res.admin || null;
  };

  const extractTokens = (res) => {
    if (!res) return { access: null, refresh: null };
    return {
      access: res.data?.accessToken || res.accessToken || null,
      refresh: res.data?.refreshToken || res.refreshToken || null,
    };
  };

  const saveAndSetTokens = (tokens) => {
    if (tokens.access) {
      storage.setAccessToken(tokens.access);
      setAccessToken(tokens.access);
    }
    if (tokens.refresh) {
      storage.setRefreshToken(tokens.refresh);
    }
  };

  const clearAuth = () => {
    storage.clearTokens();
    setUser(null);
    setAccessToken(null);
  };

  // Initialize auth on mount
  useEffect(() => {
    let cancelled = false;

    const initAuth = async () => {
      try {
        const token = storage.getAccessToken();
        const refresh = storage.getRefreshToken();

        if (!token) {
          setLoading(false);
          return;
        }

        setAccessToken(token);

        try {
          const res = await getMe();
          if (cancelled) return;
          const userData = extractUser(res);
          if (userData) {
            setUser(userData);
          }
        } catch {
          // Token expired, try refresh
          if (refresh && !cancelled) {
            try {
              const refreshRes = await apiRefreshToken(refresh);
              if (cancelled) return;
              const tokens = extractTokens(refreshRes);
              if (tokens.access) {
                saveAndSetTokens(tokens);
                const meRes = await getMe();
                if (cancelled) return;
                const userData = extractUser(meRes);
                if (userData) {
                  setUser(userData);
                } else {
                  clearAuth();
                }
              } else {
                clearAuth();
              }
            } catch {
              clearAuth();
            }
          } else {
            clearAuth();
          }
        }
      } catch {
        clearAuth();
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    initAuth();
    return () => { cancelled = true; };
  }, []);

  const login = async (email, password) => {
    const res = await apiLogin(email, password);
    const tokens = extractTokens(res);
    const userData = extractUser(res);
    saveAndSetTokens(tokens);
    if (userData) setUser(userData);
    return res;
  };

  const register = async (data) => {
    const res = await apiRegister(data);
    const tokens = extractTokens(res);
    const userData = extractUser(res);
    saveAndSetTokens(tokens);
    if (userData) setUser(userData);
    return res;
  };

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // Ignore
    }
    clearAuth();
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await getMe();
      const userData = extractUser(res);
      if (userData) setUser(userData);
    } catch {
      // Silently fail
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, accessToken, loading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};