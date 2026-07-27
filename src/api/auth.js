import api from './axios';

export const login = (email, password) => api.post('/auth/login', { email, password });
export const register = (data) => api.post('/auth/register', data);
export const verifyEmail = (token) => api.post('/auth/verify-email', { token });
export const resendVerification = () => api.post('/auth/resend-verification');
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const resetPassword = (token, password) => api.post('/auth/reset-password', { token, password });
export const refreshToken = (token) => api.post('/auth/refresh-token', { refreshToken: token });
export const logout = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');
export const verifyPhone = (data) => api.post('/auth/verify-phone', data);