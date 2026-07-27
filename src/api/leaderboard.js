import api from './axios';

export const getLeaderboard = (period = 'weekly') => api.get(`/leaderboard?period=${period}`);
export const getDepartmentLeaderboard = (dept) => api.get(`/leaderboard/department/${dept}`);
export const getMyRank = () => api.get('/leaderboard/me');
export const getTopContributors = () => api.get('/leaderboard/top');