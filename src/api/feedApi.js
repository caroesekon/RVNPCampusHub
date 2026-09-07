import axiosInstance from './axios.js';

const getFeed = (page = 1, limit = 20) => {
  return axiosInstance.get('/feed', {
    params: { page, limit },
  });
};

const getCampusFeed = (campusId, page = 1, limit = 20) => {
  return axiosInstance.get(`/feed/campus/${campusId}`, {
    params: { page, limit },
  });
};

const getFeedReels = (limit = 8) => {
  return axiosInstance.get('/feed/reels', {
    params: { limit },
  });
};

export default {
  getFeed,
  getCampusFeed,
  getFeedReels,
};