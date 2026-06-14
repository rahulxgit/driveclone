import api from './api';

export const folderService = {
  // Get folders at a level (root if no parentFolder)
  getFolders: (parentFolder = null) =>
    api.get('/folders', { params: parentFolder ? { parentFolder } : {} }),

  // Get full tree
  getFolderTree: () => api.get('/folders/tree'),

  // Get single folder + breadcrumb
  getFolder: (id) => api.get(`/folders/${id}`),

  // Get recursive size
  getFolderSize: (id) => api.get(`/folders/${id}/size`),

  // Create a folder
  createFolder: (data) => api.post('/folders', data),

  // Update a folder (rename/recolor)
  updateFolder: (id, data) => api.put(`/folders/${id}`, data),

  // Delete a folder and all contents
  deleteFolder: (id) => api.delete(`/folders/${id}`),
};
