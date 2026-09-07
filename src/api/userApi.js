import axiosInstance from './axios.js';

const getProfile = () => {
  return axiosInstance.get('/users/profile');
};

const getUserById = (id) => {
  return axiosInstance.get(`/users/${id}`);
};

const updateProfile = (data) => {
  return axiosInstance.put('/users/profile', data);
};

const updateCampus = (data) => {
  return axiosInstance.put('/users/campus', data);
};

const searchUsers = (query, page = 1, limit = 20) => {
  return axiosInstance.get('/users/search', {
    params: { q: query, page, limit },
  });
};

const getFollowers = (id, page = 1, limit = 20) => {
  return axiosInstance.get(`/users/${id}/followers`, {
    params: { page, limit },
  });
};

const getFollowing = (id, page = 1, limit = 20) => {
  return axiosInstance.get(`/users/${id}/following`, {
    params: { page, limit },
  });
};

const followUser = (id) => {
  return axiosInstance.post(`/users/${id}/follow`);
};

const unfollowUser = (id) => {
  return axiosInstance.delete(`/users/${id}/follow`);
};

export default {
  getProfile,
  getUserById,
  updateProfile,
  updateCampus,
  searchUsers,
  getFollowers,
  getFollowing,
  followUser,
  unfollowUser,
};