import api from './axios';

// Discovery & My Groups
export const getGroups = () => api.get('/groups');
export const discoverGroups = () => api.get('/groups/discover');
export const getGroupById = (id) => api.get(`/groups/${id}`);

// CRUD
export const createGroup = (data) => api.post('/groups', data);
export const updateGroup = (id, data) => api.patch(`/groups/${id}`, data);
export const deleteGroup = (id) => api.delete(`/groups/${id}`);

// Membership
export const joinGroup = (id) => api.post(`/groups/${id}/join`);
export const leaveGroup = (id) => api.post(`/groups/${id}/leave`);
export const requestToJoin = (id) => api.post(`/groups/${id}/request`);

// Admin — Member Management
export const getJoinRequests = (id) => api.get(`/groups/${id}/requests`);
export const approveMember = (id, userId) => api.post(`/groups/${id}/approve/${userId}`);
export const rejectMember = (id, userId) => api.post(`/groups/${id}/reject/${userId}`);
export const removeMember = (id, userId) => api.delete(`/groups/${id}/member/${userId}`);

// Admin — Moderators
export const addModerator = (id, userId) => api.post(`/groups/${id}/moderator/${userId}`);
export const removeModerator = (id, userId) => api.post(`/groups/${id}/remove-moderator/${userId}`);

// Admin — Settings
export const updateGroupSettings = (id, data) => api.patch(`/groups/${id}/settings`, data);

// Content
export const getGroupWall = (id, page = 1) => api.get(`/groups/${id}/wall?page=${page}`);
export const getGroupEvents = (id) => api.get(`/groups/${id}/events`);
export const createGroupEvent = (id, data) => api.post(`/groups/${id}/events`, data);
export const rsvpEvent = (id, eventId) => api.post(`/groups/${id}/events/${eventId}/rsvp`);
export const getGroupFiles = (id) => api.get(`/groups/${id}/files`);
export const uploadGroupFile = (id, formData) => api.post(`/groups/${id}/files`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const deleteGroupFile = (id, fileId) => api.delete(`/groups/${id}/files/${fileId}`);

// Reporting
export const reportGroup = (id, data) => api.post(`/groups/${id}/report`, data);