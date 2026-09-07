import axiosInstance from './axios.js';

const getTopContributors = (period = 'all', limit = 10) => {
  return axiosInstance.get('/leaderboard/contributors', {
    params: { period, limit },
  });
};

const getTopFans = (limit = 10) => {
  return axiosInstance.get('/leaderboard/fans', { params: { limit } });
};

export default {
  getTopContributors,
  getTopFans,
};