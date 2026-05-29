import apiClient from './apiClient';

export const liturgyService = {
  getAll: async () => {
    const response = await apiClient.get('/liturgy');
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/liturgy/${id}`);
    return response.data;
  },


  create: async (liturgyData) => {
    const response = await apiClient.post('/liturgy', liturgyData);
    return response.data;
  },

  update: async (id, liturgyData) => {
    const response = await apiClient.put(`/liturgy/${id}`, liturgyData);
    return response.data;
  },

  delete: async (id) => {
    await apiClient.delete(`/liturgy/${id}`);
  }
};
