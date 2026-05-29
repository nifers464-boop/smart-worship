import apiClient from './apiClient';

export const liturgyTemplateService = {
  getAll: async () => {
    const response = await apiClient.get('/liturgy-templates');
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post('/liturgy-templates', data);
    return response.data;
  },

  delete: async (id) => {
    await apiClient.delete(`/liturgy-templates/${id}`);
  }
};
