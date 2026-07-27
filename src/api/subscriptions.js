import api from './axios';

export const getPlans = () => api.get('/subscriptions/plans');
export const getMySubscription = () => api.get('/subscriptions/me');
export const subscribe = (data) => api.post('/subscriptions', data);
export const cancelSubscription = (reason) => api.post('/subscriptions/cancel', { reason });
export const getPaymentMethods = () => api.get('/subscriptions/payment-methods');
export const getBillingHistory = () => api.get('/subscriptions/billing');