import api from './axios';

export const toggleReaction = (postId, type) => api.post(`/posts/${postId}/reactions`, { type });
export const getReactions = (postId) => api.get(`/posts/${postId}/reactions`);
export const toggleCommentReaction = (commentId, type) => api.post(`/comments/${commentId}/like`, { type });