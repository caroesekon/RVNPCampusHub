import axiosInstance from './axios.js';

const getFriends = (page = 1, limit = 20) => {
  return axiosInstance.get('/friends', {
    params: { page, limit },
  });
};

const getFriendCount = () => {
  return axiosInstance.get('/friends/count');
};

const getFriendSuggestions = (limit = 10) => {
  return axiosInstance.get('/friends/suggestions', {
    params: { limit },
  });
};

const checkFriendship = (userId) => {
  return axiosInstance.get(`/friends/${userId}`);
};

const getMessageableUsers = (page = 1, limit = 50) => {
  return axiosInstance.get('/friends/messageable', {
    params: { page, limit },
  });
};

export default {
  getFriends,
  getFriendCount,
  getFriendSuggestions,
  checkFriendship,
  getMessageableUsers,
};