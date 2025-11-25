import api from './api';

export const reportService = {
  async exportReport(validationId) {
    const response = await api.get(`/api/export/${validationId}`);
    return response.data;
  },
};

