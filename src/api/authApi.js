import axiosInstance from './axios.js';

const register = (data) => {
  return axiosInstance.post('/auth/register', data);
};

const verifyRegistration = (tempId, otp) => {
  return axiosInstance.post('/auth/verify-registration', { tempId, otp });
};

const login = (data) => {
  return axiosInstance.post('/auth/login', data);
};

const forgotPassword = (email) => {
  return axiosInstance.post('/auth/forgot-password', { email });
};

const resetPassword = (data) => {
  return axiosInstance.post('/auth/reset-password', data);
};

const logout = () => {
  return axiosInstance.post('/auth/logout');
};

const refreshToken = (refreshToken) => {
  return axiosInstance.post('/auth/refresh-token', { refreshToken });
};

export default {
  register,
  verifyRegistration,
  login,
  forgotPassword,
  resetPassword,
  logout,
  refreshToken,
};