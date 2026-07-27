import api from './axios';

export const searchAll = (q) => api.get(`/search?q=${encodeURIComponent(q)}`);
export const searchUsers = (q, page = 1) => api.get(`/search/users?q=${encodeURIComponent(q)}&page=${page}`);
export const searchPosts = (q, page = 1) => api.get(`/search/posts?q=${encodeURIComponent(q)}&page=${page}`);
export const searchGroups = (q, page = 1) => api.get(`/search/groups?q=${encodeURIComponent(q)}&page=${page}`);
export const searchMarketplace = (q, page = 1, category) => api.get(`/search/market?q=${encodeURIComponent(q)}&page=${page}${category ? `&category=${category}` : ''}`);