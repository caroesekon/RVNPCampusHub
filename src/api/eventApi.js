import axiosInstance from './axios.js';

const createEvent = (data) => {
  return axiosInstance.post('/events', data);
};

const getAllEvents = (page = 1, limit = 20, campusId = null, status = null) => {
  return axiosInstance.get('/events', {
    params: { page, limit, campusId, status },
  });
};

const getEventById = (id) => {
  return axiosInstance.get(`/events/${id}`);
};

const getUpcomingEvents = (campusId = null, limit = 10) => {
  return axiosInstance.get('/events/upcoming', {
    params: { campusId, limit },
  });
};

const getOngoingEvents = (campusId = null) => {
  return axiosInstance.get('/events/ongoing', {
    params: { campusId },
  });
};

const updateEvent = (id, data) => {
  return axiosInstance.put(`/events/${id}`, data);
};

const cancelEvent = (id) => {
  return axiosInstance.delete(`/events/${id}`);
};

export default {
  createEvent,
  getAllEvents,
  getEventById,
  getUpcomingEvents,
  getOngoingEvents,
  updateEvent,
  cancelEvent,
};