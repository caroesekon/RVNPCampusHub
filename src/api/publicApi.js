import axiosInstance from './axios.js';

const getSettings = () => {
  return axiosInstance.get('/public/settings');
};

const getCampuses = () => {
  return axiosInstance.get('/public/campuses');
};

const getCampusById = (id) => {
  return axiosInstance.get(`/public/campuses/${id}`);
};

const getLegals = () => {
  return axiosInstance.get('/public/legals');
};

const getLegalByType = (type) => {
  return axiosInstance.get(`/public/legals/${type}`);
};

export default {
  getSettings,
  getCampuses,
  getCampusById,
  getLegals,
  getLegalByType,
};