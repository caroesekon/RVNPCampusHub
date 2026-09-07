import axiosInstance from './axios.js';

const createListing = (data) => {
  return axiosInstance.post('/marketplace', data);
};

const getAllListings = (params = {}) => {
  return axiosInstance.get('/marketplace', { params });
};

const getListingById = (id) => {
  return axiosInstance.get(`/marketplace/${id}`);
};

const updateListing = (id, data) => {
  return axiosInstance.put(`/marketplace/${id}`, data);
};

const deleteListing = (id) => {
  return axiosInstance.delete(`/marketplace/${id}`);
};

const markAsSold = (id) => {
  return axiosInstance.put(`/marketplace/${id}/sold`);
};

const markAsActive = (id) => {
  return axiosInstance.put(`/marketplace/${id}/active`);
};

const getMyListings = (page = 1, limit = 20, status = null) => {
  return axiosInstance.get('/marketplace/my-listings', {
    params: { page, limit, status },
  });
};

const getCategories = () => {
  return axiosInstance.get('/marketplace/categories');
};

const addOffer = (id, amount, message = null) => {
  return axiosInstance.post(`/marketplace/${id}/offers`, { amount, message });
};

const getOffers = (id) => {
  return axiosInstance.get(`/marketplace/${id}/offers`);
};

export default {
  createListing,
  getAllListings,
  getListingById,
  updateListing,
  deleteListing,
  markAsSold,
  markAsActive,
  getMyListings,
  getCategories,
  addOffer,
  getOffers,
};