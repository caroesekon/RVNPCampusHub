import axiosInstance from './axios.js';

const searchAll = (query, page = 1, limit = 10) => {
  return axiosInstance.get('/search', {
    params: { q: query, page, limit },
  });
};

const searchUsers = (query, page = 1, limit = 20) => {
  return axiosInstance.get('/search/users', {
    params: { q: query, page, limit },
  });
};

const searchPosts = (query, page = 1, limit = 20) => {
  return axiosInstance.get('/search/posts', {
    params: { q: query, page, limit },
  });
};

const searchReels = (query, page = 1, limit = 20) => {
  return axiosInstance.get('/search/reels', {
    params: { q: query, page, limit },
  });
};

const searchGroups = (query, page = 1, limit = 20) => {
  return axiosInstance.get('/search/groups', {
    params: { q: query, page, limit },
  });
};

const searchEvents = (query, page = 1, limit = 20) => {
  return axiosInstance.get('/search/events', {
    params: { q: query, page, limit },
  });
};

const searchMarketplace = (query, page = 1, limit = 20) => {
  return axiosInstance.get('/search/marketplace', {
    params: { q: query, page, limit },
  });
};

export default {
  searchAll,
  searchUsers,
  searchPosts,
  searchReels,
  searchGroups,
  searchEvents,
  searchMarketplace,
};