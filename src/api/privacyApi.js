import axiosInstance from './axios.js';

const getPrivacySettings = () => {
  return axiosInstance.get('/privacy');
};

const updatePrivacySettings = (settings) => {
  return axiosInstance.put('/privacy', settings);
};

const resetPrivacySettings = () => {
  return axiosInstance.post('/privacy/reset');
};

export default {
  getPrivacySettings,
  updatePrivacySettings,
  resetPrivacySettings,
};