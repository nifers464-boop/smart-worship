import apiClient from './apiClient';

export const songService = {
  getAll: async (search = '', page = 1, limit = 100) => {
    const response = await apiClient.get('/songs', {
      params: { search, page, limit }
    });
    return response.data; // Response format: { data: [], pagination: {} }
  },

  getById: async (id) => {
    const response = await apiClient.get(`/songs/${id}`);
    return response.data;
  },

  create: async (songData) => {
    const response = await apiClient.post('/songs', songData);
    return response.data;
  },

  update: async (id, songData) => {
    const response = await apiClient.put(`/songs/${id}`, songData);
    return response.data;
  },

  delete: async (id) => {
    await apiClient.delete(`/songs/${id}`);
  },

  seed: async () => {
    const response = await apiClient.post('/songs/seed/gmim-songs');
    return response.data;
  },
  
  createBulk: async (songs) => {
    const response = await apiClient.post('/songs/bulk', { songs });
    return response.data;
  },
  
  deleteAll: async () => {
    const response = await apiClient.delete('/songs/all/confirm');
    return response.data;
  }
};
