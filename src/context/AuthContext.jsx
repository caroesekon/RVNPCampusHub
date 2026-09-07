import { createContext, useContext, useState, useEffect } from 'react';
import authApi from '../api/authApi.js';
import userApi from '../api/userApi.js';
import storage from '../utils/storage.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = storage.getAccessToken();
    const savedUser = storage.getUser();

    if (token && savedUser) {
      setUser(savedUser);
      setIsAuthenticated(true);
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await authApi.login({ email, password });

    if (response.data.success) {
      const { user, accessToken, refreshToken } = response.data.data;

      storage.setAccessToken(accessToken);
      storage.setRefreshToken(refreshToken);
      storage.setUser(user);

      setUser(user);
      setIsAuthenticated(true);
    }

    return response.data;
  };

  const register = async (data) => {
    const response = await authApi.register(data);
    return response.data;
  };

  const verifyRegistration = async (tempId, otp) => {
    const response = await authApi.verifyRegistration(tempId, otp);

    if (response.data.success) {
      const { user, accessToken, refreshToken } = response.data.data;

      storage.setAccessToken(accessToken);
      storage.setRefreshToken(refreshToken);
      storage.setUser(user);

      setUser(user);
      setIsAuthenticated(true);
    }

    return response.data;
  };

  const refreshUser = async () => {
    try {
      const response = await userApi.getProfile();

      if (response.data.success) {
        setUser(response.data.data);
        storage.setUser(response.data.data);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error.message);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error.message);
    }

    storage.clearAll();
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    storage.setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        register,
        verifyRegistration,
        refreshUser,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};