import axiosInstance from './axios.js';

const getAll = (page = 1, limit = 50) => {
  return axiosInstance.get('/hashtags', {
    params: { page, limit },
  });
};

const getTrending = (limit = 10) => {
  return axiosInstance.get('/hashtags/trending', {
    params: { limit },
  });
};

export default {
  getAll,
  getTrending,
};