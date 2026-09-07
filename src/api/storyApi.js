import axiosInstance from './axios.js';

const createStory = (data) => {
  return axiosInstance.post('/stories', data);
};

const getActiveStories = (campusId = null) => {
  return axiosInstance.get('/stories', {
    params: { campusId },
  });
};

const getMyStories = () => {
  return axiosInstance.get('/stories/my-stories');
};

const getStoryById = (id) => {
  return axiosInstance.get(`/stories/${id}`);
};

const getViewers = (storyId) => {
  return axiosInstance.get(`/stories/${storyId}/viewers`);
};

const getReactions = (storyId) => {
  return axiosInstance.get(`/stories/${storyId}/reactions`);
};

const reactToStory = (storyId, type = 'LIKE') => {
  return axiosInstance.post(`/stories/${storyId}/react`, { type });
};

const removeReaction = (storyId) => {
  return axiosInstance.delete(`/stories/${storyId}/react`);
};

const deleteStory = (id) => {
  return axiosInstance.delete(`/stories/${id}`);
};

export default {
  createStory,
  getActiveStories,
  getMyStories,
  getStoryById,
  getViewers,
  getReactions,
  reactToStory,
  removeReaction,
  deleteStory,
};