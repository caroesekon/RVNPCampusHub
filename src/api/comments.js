import api from './axios';

export const getComments = (postId, page = 1) => api.get(`/posts/${postId}/comments?page=${page}`);
export const createComment = (postId, data) => api.post(`/posts/${postId}/comments`, data);
export const deleteComment = (commentId) => api.delete(`/comments/${commentId}`);
export const getReplies = (commentId, page = 1) => api.get(`/comments/${commentId}/replies?page=${page}`);