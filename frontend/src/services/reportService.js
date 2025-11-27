import api from './api';

export const reportService = {
  async exportReport(validationId) {
    const response = await api.get(`/api/export/${validationId}`);
    return response.data;
  },

  async downloadReport(validationId) {
    try {
      const response = await api.get(`/api/download/${validationId}`, {
        responseType: 'blob'
      });
      
      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `validation_report_${validationId}.json`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Report downloaded successfully' };
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  },
};

