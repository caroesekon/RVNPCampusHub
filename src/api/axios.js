import axios from 'axios';
import storage from '../utils/storage.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = storage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = storage.getRefreshToken();

      if (refreshToken) {
        try {
          const response = await axios.post(
            `${API_URL}/auth/refresh-token`,
            { refreshToken }
          );

          if (response.data.success) {
            const { accessToken, refreshToken: newRefreshToken } = response.data.data;

            storage.setAccessToken(accessToken);
            storage.setRefreshToken(newRefreshToken);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return axiosInstance(originalRequest);
          }
        } catch {
          storage.clearAll();
          window.location.href = '/login';
          return Promise.reject(error);
        }
      }

      storage.clearAll();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;