import api from './axios';

export const getStories = () => api.get('/stories');
export const createStory = (formData) => api.post('/stories', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const createTextStory = (data) => api.post('/stories', data);
export const deleteStory = (id) => api.delete(`/stories/${id}`);
export const viewStory = (id) => api.post(`/stories/${id}/view`);
export const getStoryViewers = (id) => api.get(`/stories/${id}/viewers`);
export const reactToStory = (id, reaction) => api.post(`/stories/${id}/react`, { reaction });
export const createDepartmentStory = (formData) => api.post('/stories/department', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const reportStory = (id, data) => api.post(`/stories/${id}/report`, data);