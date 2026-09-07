import axiosInstance from './axios.js';

const getAllBadges = () => {
  return axiosInstance.get('/badges');
};

const getUserBadges = (userId) => {
  return axiosInstance.get(`/badges/user/${userId}`);
};

const checkMyBadges = () => {
  return axiosInstance.get('/badges/check');
};

export default {
  getAllBadges,
  getUserBadges,
  checkMyBadges,
};