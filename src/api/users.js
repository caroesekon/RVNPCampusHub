import api from './axios';

export const getProfile = (id) => api.get(`/users/${id}`);
export const getMyProfile = () => api.get('/users/me');
export const updateProfile = (data) => api.patch('/users/me', data);
export const uploadAvatar = (formData) => api.post('/users/me/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const uploadCoverPhoto = (formData) => api.post('/users/me/cover', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const removeCoverPhoto = () => api.delete('/users/me/cover');
export const deleteAccount = () => api.delete('/users/me');
export const updateSettings = (data) => api.patch('/users/me/settings', data);
export const getUserBadges = (id) => api.get(`/users/${id}/badges`);
export const getUserPosts = (id, page = 1) => api.get(`/users/${id}/posts?page=${page}`);
export const getUserListings = (id, page = 1) => api.get(`/users/${id}/listings?page=${page}`);
export const applyVerification = (data) => api.post('/users/me/verify', data);
export const checkVerificationStatus = () => api.get('/users/me/verification-status');
export const updateFirebaseToken = (token) => api.patch('/users/me/firebase-token', { token });
export const toggleOnline = (online) => api.post('/users/me/online', { online });
