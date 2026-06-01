import api from './api';

export const uploadImage = async (file, type = 'image') => {
  const formData = new FormData();
  formData.append('file', file);
  
  let endpoint = '/school/upload-logo';
  if (type === 'banner') {
    endpoint = '/school/upload-banner';
  }
  
  const response = await api.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const uploadMultipleImages = async (files, endpoint = '/news/upload-images') => {
  const formData = new FormData();
  
  files.forEach(file => {
    formData.append('files', file);
  });
  
  const response = await api.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 60000, // 60 seconds for multiple images
  });
  
  return response.data;
};

export const deleteImage = async (imageUrl) => {
  const response = await api.delete('/uploads/delete', {
    data: { image_url: imageUrl }
  });
  return response.data;
};