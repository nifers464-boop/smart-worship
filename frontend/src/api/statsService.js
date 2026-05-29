import apiClient from './apiClient';

export const statsService = {
  getStats: async () => {
    const response = await apiClient.get('/stats');
    return response.data;
  }
};
