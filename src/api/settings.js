import api from './axios';

export const getAccountSettings = () => api.get('/settings/account');
export const updateAccountSettings = (data) => api.patch('/settings/account', data);
export const changePassword = (data) => api.patch('/settings/password', data);
export const updateNotificationSettings = (data) => api.patch('/settings/notifications', data);
export const updateTheme = (data) => api.patch('/settings/theme', data);
export const deactivateAccount = () => api.delete('/settings/deactivate');