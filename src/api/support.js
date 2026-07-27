import api from './axios';

export const getTickets = () => api.get('/support/tickets');
export const getTicketById = (id) => api.get(`/support/tickets/${id}`);
export const createTicket = (data) => api.post('/support/tickets', data);
export const respondToTicket = (id, message) => api.post(`/support/tickets/${id}/respond`, { message });