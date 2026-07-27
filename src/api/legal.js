import api from './axios';

export const getTermsOfService = () => api.get('/legal/terms');
export const getPrivacyPolicy = () => api.get('/legal/privacy');
export const getCommunityGuidelines = () => api.get('/legal/guidelines');
export const getMarketplacePolicy = () => api.get('/legal/marketplace');
export const getAllLegals = () => api.get('/legal');