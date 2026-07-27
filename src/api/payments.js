import api from './axios';

export const getPlans = () => api.get('/plans');
export const getPaymentMethods = () => api.get('/plans/payment-methods');
export const initiateMpesaPayment = (data) => api.post('/payments/mpesa/initiate', data);
export const verifyTransaction = (transactionId) => api.get(`/payments/verify/${transactionId}`);
export const getPaymentHistory = () => api.get('/payments/history');