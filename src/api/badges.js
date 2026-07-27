import api from './axios';

export const getMyBadges = () => api.get('/badges');
export const getBadgeById = (id) => api.get(`/badges/${id}`);
export const getBadgeProgress = () => api.get('/badges/progress');