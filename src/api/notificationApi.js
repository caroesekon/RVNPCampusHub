import axiosInstance from './axios.js';

const getNotifications = (page = 1, limit = 20, unreadOnly = false) => {
  return axiosInstance.get('/notifications', {
    params: { page, limit, unreadOnly },
  });
};

const getUnreadCount = () => {
  return axiosInstance.get('/notifications/unread-count');
};

const markAsRead = (id) => {
  return axiosInstance.put(`/notifications/${id}/read`);
};

const markAllAsRead = () => {
  return axiosInstance.put('/notifications/mark-all-read');
};

const deleteNotification = (id) => {
  return axiosInstance.delete(`/notifications/${id}`);
};

const deleteAllNotifications = () => {
  return axiosInstance.delete('/notifications/delete-all');
};

export default {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
};