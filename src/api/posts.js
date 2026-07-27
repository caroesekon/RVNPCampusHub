import api from './axios';

export const getFeed = (tab = 'all', page = 1) => api.get(`/posts?tab=${tab}&page=${page}`);
export const getPostById = (id) => api.get(`/posts/${id}`);
export const createPost = (formData) => api.post('/posts', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const updatePost = (id, data) => api.patch(`/posts/${id}`, data);
export const deletePost = (id) => api.delete(`/posts/${id}`);
export const likePost = (id) => api.post(`/posts/${id}/like`);
export const commentOnPost = (id, content) => api.post(`/posts/${id}/comment`, { content });
export const deleteComment = (postId, commentId) => api.delete(`/posts/${postId}/comment/${commentId}`);
export const repost = (id) => api.post(`/posts/${id}/repost`);
export const reportPost = (id, data) => api.post(`/posts/${id}/report`, data);
export const markLostFoundClaimed = (id) => api.patch(`/posts/${id}/claim`);
export const getComments = (id, page = 1) => api.get(`/posts/${id}/comments?page=${page}`);