import axiosInstance from './axios.js';

const getStatus = () => {
  return axiosInstance.get('/ai/status');
};

const chat = (message) => {
  return axiosInstance.post('/ai/chat', { message });
};

const generateContent = (prompt) => {
  return axiosInstance.post('/ai/content', { prompt });
};

const analyzeComments = (postId) => {
  return axiosInstance.get(`/ai/comments/${postId}`);
};

export default {
  getStatus,
  chat,
  generateContent,
  analyzeComments,
};