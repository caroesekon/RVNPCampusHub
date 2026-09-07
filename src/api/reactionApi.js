import axiosInstance from './axios.js';

const getPostReactions = (postId) => {
  return axiosInstance.get(`/reactions/post/${postId}`);
};

const getReelReactions = (reelId) => {
  return axiosInstance.get(`/reactions/reel/${reelId}`);
};

const getCommentReactions = (commentId) => {
  return axiosInstance.get(`/reactions/comment/${commentId}`);
};

const getPostReactionSummary = (postId) => {
  return axiosInstance.get(`/reactions/post/${postId}/summary`);
};

const getReelReactionSummary = (reelId) => {
  return axiosInstance.get(`/reactions/reel/${reelId}/summary`);
};

const getCommentReactionSummary = (commentId) => {
  return axiosInstance.get(`/reactions/comment/${commentId}/summary`);
};

export default {
  getPostReactions,
  getReelReactions,
  getCommentReactions,
  getPostReactionSummary,
  getReelReactionSummary,
  getCommentReactionSummary,
};