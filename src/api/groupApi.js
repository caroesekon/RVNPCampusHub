import axiosInstance from './axios.js';

const createGroup = (data) => {
  return axiosInstance.post('/groups', data);
};

const getAllGroups = (page = 1, limit = 20, campusId = null, search = null, category = null) => {
  return axiosInstance.get('/groups', {
    params: { page, limit, campusId, search, category },
  });
};

const getGroupById = (id) => {
  return axiosInstance.get(`/groups/${id}`);
};

const updateGroup = (id, data) => {
  return axiosInstance.put(`/groups/${id}`, data);
};

const deleteGroup = (id) => {
  return axiosInstance.delete(`/groups/${id}`);
};

const getGroupMembers = (id, page = 1, limit = 50) => {
  return axiosInstance.get(`/groups/${id}/members`, {
    params: { page, limit },
  });
};

const joinGroup = (id) => {
  return axiosInstance.post(`/groups/${id}/join`);
};

const leaveGroup = (id) => {
  return axiosInstance.delete(`/groups/${id}/leave`);
};

const inviteToGroup = (id, userId) => {
  return axiosInstance.post(`/groups/${id}/invite`, { userId });
};

const getMyGroups = () => {
  return axiosInstance.get('/groups/my-groups');
};

const createGroupPost = (groupId, content) => {
  return axiosInstance.post(`/groups/${groupId}/posts`, { content });
};

const getGroupPosts = (groupId, page = 1, limit = 20) => {
  return axiosInstance.get(`/groups/${groupId}/posts`, {
    params: { page, limit },
  });
};

export default {
  createGroup,
  getAllGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  getGroupMembers,
  joinGroup,
  leaveGroup,
  inviteToGroup,
  getMyGroups,
  createGroupPost,
  getGroupPosts,
};