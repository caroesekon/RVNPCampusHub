import api from './axios';

export const getPrivacySettings = () => api.get('/privacy');
export const updatePrivacySettings = (data) => api.patch('/privacy', data);
export const blockUser = (userId) => api.post(`/privacy/block/${userId}`);
export const unblockUser = (userId) => api.post(`/privacy/unblock/${userId}`);
export const getBlockedUsers = () => api.get('/privacy/blocked');