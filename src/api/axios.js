import axios from 'axios';
import { storage } from '@/utils/storage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = storage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (!config.url.startsWith('http')) {
    config.url = API_URL + config.url;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error.response?.data || error)
);

export default api;