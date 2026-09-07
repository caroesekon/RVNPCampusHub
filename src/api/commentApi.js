import axiosInstance from './axios.js';

const createComment = (data) => {
  return axiosInstance.post('/comments', data);
};

const getPostComments = (postId, page = 1, limit = 20) => {
  return axiosInstance.get(`/comments/post/${postId}`, {
    params: { page, limit },
  });
};

const getReelComments = (reelId, page = 1, limit = 20) => {
  return axiosInstance.get(`/comments/reel/${reelId}`, {
    params: { page, limit },
  });
};

const getReplies = (commentId, page = 1, limit = 10) => {
  return axiosInstance.get(`/comments/${commentId}/replies`, {
    params: { page, limit },
  });
};

const updateComment = (id, data) => {
  return axiosInstance.put(`/comments/${id}`, data);
};

const deleteComment = (id) => {
  return axiosInstance.delete(`/comments/${id}`);
};

const likeComment = (id) => {
  return axiosInstance.post(`/comments/${id}/like`);
};

const unlikeComment = (id) => {
  return axiosInstance.delete(`/comments/${id}/like`);
};

export default {
  createComment,
  getPostComments,
  getReelComments,
  getReplies,
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment,
};