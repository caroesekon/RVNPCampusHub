import axiosInstance from './axios.js';

const createReel = (data) => {
  return axiosInstance.post('/reels', data);
};

const getReelFeed = (page = 1, limit = 10, campusId = null) => {
  return axiosInstance.get('/reels/feed', {
    params: { page, limit, campusId },
  });
};

const getReelById = (id) => {
  return axiosInstance.get(`/reels/${id}`);
};

const updateReel = (id, data) => {
  return axiosInstance.put(`/reels/${id}`, data);
};

const deleteReel = (id) => {
  return axiosInstance.delete(`/reels/${id}`);
};

const getMyReels = (page = 1, limit = 10) => {
  return axiosInstance.get('/reels/my-reels', {
    params: { page, limit },
  });
};

const getUserReels = (userId, page = 1, limit = 10) => {
  return axiosInstance.get(`/reels/user/${userId}`, {
    params: { page, limit },
  });
};

const reactToReel = (id, type) => {
  return axiosInstance.post(`/reels/${id}/react`, { type });
};

const removeReaction = (id) => {
  return axiosInstance.delete(`/reels/${id}/react`);
};

const incrementView = (id) => {
  return axiosInstance.post(`/reels/${id}/view`);
};

const shareReel = (id) => {
  return axiosInstance.post(`/reels/${id}/share`);
};

export default {
  createReel,
  getReelFeed,
  getReelById,
  updateReel,
  deleteReel,
  getMyReels,
  getUserReels,
  reactToReel,
  removeReaction,
  incrementView,
  shareReel,
};