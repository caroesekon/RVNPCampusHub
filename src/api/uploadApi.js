import axiosInstance from './axios.js';

const uploadSingle = (file) => {
  const formData = new FormData();
  formData.append('file', file);

  return axiosInstance.post('/upload/single', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

const uploadMultiple = (files) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append('files', file);
  });

  return axiosInstance.post('/upload/multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

const deleteFile = (publicId, resourceType = 'image') => {
  return axiosInstance.delete('/upload', {
    data: { publicId, resourceType },
  });
};

export default {
  uploadSingle,
  uploadMultiple,
  deleteFile,
};