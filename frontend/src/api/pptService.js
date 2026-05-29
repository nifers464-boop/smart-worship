import apiClient from './apiClient';

export const pptService = {
  // Projects
  getProjects: async () => {
    const response = await apiClient.get('/ppt/projects');
    return response.data;
  },

  createProject: async (data) => {
    const response = await apiClient.post('/ppt/projects', data);
    return response.data;
  },

  updateProject: async (id, data) => {
    const response = await apiClient.put(`/ppt/projects/${id}`, data);
    return response.data;
  },

  deleteProject: async (id) => {
    await apiClient.delete(`/ppt/projects/${id}`);
  },

  // Generation
  generate: async (pptData) => {
    const response = await apiClient.post('/ppt/generate', pptData);
    return response.data;
  },

  getDownloadUrl: (fileName) => {
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    return `${baseUrl}/ppt/download/${fileName}`;
  }
};
