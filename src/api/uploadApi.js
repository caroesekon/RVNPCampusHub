import axiosInstance from './axios.js';

const uploadSingle = (file, onProgress = null) => {
  const formData = new FormData();
  formData.append('file', file);

  return axiosInstance.post('/upload/single', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });
};

const uploadMultiple = (files, onProgress = null) => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append('files', file);
  });

  return axiosInstance.post('/upload/multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
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