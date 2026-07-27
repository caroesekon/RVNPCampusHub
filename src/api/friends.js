import api from './axios';

export const followUser = (userId) => api.post(`/friends/follow/${userId}`);
export const unfollowUser = (userId) => api.post(`/friends/unfollow/${userId}`);
export const getFollowers = (userId) => api.get(`/friends/followers/${userId}`);
export const getFollowing = (userId) => api.get(`/friends/following/${userId}`);
export const removeFollower = (userId) => api.delete(`/friends/remove/${userId}`);