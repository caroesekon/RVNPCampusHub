import axiosInstance from './axios.js';

const createPost = (data) => {
  return axiosInstance.post('/posts', data);
};

const getPostById = (id) => {
  return axiosInstance.get(`/posts/${id}`);
};

const updatePost = (id, data) => {
  return axiosInstance.put(`/posts/${id}`, data);
};

const deletePost = (id) => {
  return axiosInstance.delete(`/posts/${id}`);
};

const getMyPosts = (page = 1, limit = 20) => {
  return axiosInstance.get('/posts/my-posts', {
    params: { page, limit },
  });
};

const getUserPosts = (id, page = 1, limit = 20) => {
  return axiosInstance.get(`/posts/user/${id}`, {
    params: { page, limit },
  });
};

const reactToPost = (id, type) => {
  return axiosInstance.post(`/posts/${id}/react`, { type });
};

const removeReaction = (id) => {
  return axiosInstance.delete(`/posts/${id}/react`);
};

const sharePost = (id, data = {}) => {
  return axiosInstance.post(`/posts/${id}/share`, data);
};

export default {
  createPost,
  getPostById,
  updatePost,
  deletePost,
  getMyPosts,
  getUserPosts,
  reactToPost,
  removeReaction,
  sharePost,
};