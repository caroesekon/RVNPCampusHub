import api from './axios';

export const getNotifications = (page = 1) => api.get(`/notifications?page=${page}`);
export const getUnreadCount = () => api.get('/notifications/unread-count');
export const markAsRead = (id) => api.patch(`/notifications/${id}/read`);
export const markAllAsRead = () => api.patch('/notifications/read-all');
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);
export const updatePreferences = (data) => api.patch('/notifications/preferences', data);