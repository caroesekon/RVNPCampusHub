import axiosInstance from './axios.js';

const getAllCampuses = () => {
  return axiosInstance.get('/campuses');
};

const getCampusById = (id) => {
  return axiosInstance.get(`/campuses/${id}`);
};

const getCampusUsers = (id, page = 1, limit = 20) => {
  return axiosInstance.get(`/campuses/${id}/users`, {
    params: { page, limit },
  });
};

const getCampusDepartments = (id) => {
  return axiosInstance.get(`/campuses/${id}/departments`);
};

export default {
  getAllCampuses,
  getCampusById,
  getCampusUsers,
  getCampusDepartments,
};