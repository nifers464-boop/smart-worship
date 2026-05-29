import apiClient from './apiClient';

export const multimediaService = {
  // Operators (Members)
  getOperators: async () => {
    const response = await apiClient.get('/multimedia/operators');
    return response.data;
  },

  createOperator: async (name) => {
    const response = await apiClient.post('/multimedia/operators', { name });
    return response.data;
  },

  deleteOperator: async (id) => {
    await apiClient.delete(`/multimedia/operators/${id}`);
  },

  // Schedules
  getSchedules: async (month, year) => {
    const response = await apiClient.get('/multimedia/schedules', {
      params: { month, year }
    });
    return response.data;
  },

  createSchedule: async (data) => {
    const response = await apiClient.post('/multimedia/schedules', data);
    return response.data;
  },

  updateSchedule: async (id, data) => {
    const response = await apiClient.put(`/multimedia/schedules/${id}`, data);
    return response.data;
  },

  deleteSchedule: async (id) => {
    await apiClient.delete(`/multimedia/schedules/${id}`);
  },

  deleteAllSchedules: async () => {
    await apiClient.delete('/multimedia/schedules');
  },

  generateSchedules: async (month, year, schedules) => {
    const response = await apiClient.post('/multimedia/schedules/generate', {
      month,
      year,
      schedules
    });
    return response.data;
  }
};
