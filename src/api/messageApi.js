import axiosInstance from './axios.js';

const getConversations = (page = 1, limit = 20) => {
  return axiosInstance.get('/messages/conversations', {
    params: { page, limit },
  });
};

const createDirectConversation = (recipientId) => {
  return axiosInstance.post('/messages/conversations', { recipientId });
};

const getConversationById = (id) => {
  return axiosInstance.get(`/messages/conversations/${id}`);
};

const getMessages = (conversationId, page = 1, limit = 50) => {
  return axiosInstance.get(`/messages/conversations/${conversationId}/messages`, {
    params: { page, limit },
  });
};

const sendMessage = (conversationId, data) => {
  return axiosInstance.post(`/messages/conversations/${conversationId}/messages`, data);
};

const deleteMessage = (messageId) => {
  return axiosInstance.delete(`/messages/messages/${messageId}`);
};

const getUnreadCount = () => {
  return axiosInstance.get('/messages/unread-count');
};

export default {
  getConversations,
  createDirectConversation,
  getConversationById,
  getMessages,
  sendMessage,
  deleteMessage,
  getUnreadCount,
};