import api from './axios';

export const getListings = (category = 'all', page = 1) => api.get(`/market?category=${category}&page=${page}`);
export const getListingById = (id) => api.get(`/market/${id}`);
export const createListing = (formData) => api.post('/market', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const updateListing = (id, data) => api.patch(`/market/${id}`, data);
export const deleteListing = (id) => api.delete(`/market/${id}`);
export const markInterested = (id) => api.post(`/market/${id}/interested`);
export const markAsSold = (id, buyerId) => api.patch(`/market/${id}/sold`, { buyerId });
export const rateTransaction = (id, rating) => api.post(`/market/${id}/rate`, { rating });
export const getMyListings = () => api.get('/market/my/listings');
export const reportListing = (id, data) => api.post(`/market/${id}/report`, data);