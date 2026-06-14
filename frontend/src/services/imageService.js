import api from './api';

export const imageService = {
  // Upload image to a folder (multipart/form-data)
  uploadImage: (folderId, file, onProgress) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post(`/images/upload/${folderId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
  },

  // Get images in a folder
  getImagesByFolder: (folderId) => api.get(`/images/folder/${folderId}`),

  // Get all user images
  getAllImages: () => api.get('/images'),

  // Delete an image
  deleteImage: (id) => api.delete(`/images/${id}`),
};
