import api from './axios';

export const getSiteConfig = () => api.get('/site/config');
export const getSiteToggles = () => api.get('/site/toggles');
export const getDownloads = () => api.get('/site/downloads');
export const getContactInfo = () => api.get('/site/contact');
export const getMaintenanceStatus = () => api.get('/site/maintenance');