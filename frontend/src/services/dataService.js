import api from './api';

export const dataService = {
  async getAllUploads() {
    try {
      const response = await api.get('/api/uploads');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch uploads:', error);
      return [];
    }
  },

  async getAllValidations() {
    try {
      const response = await api.get('/api/validations');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch validations:', error);
      return [];
    }
  },

  async getStats() {
    try {
      const uploads = await this.getAllUploads();
      const validations = await this.getAllValidations();
      
      const totalUploads = uploads.length || 0;
      const totalValidations = validations.length || 0;
      
      // Calculate success rate
      const successfulValidations = validations.filter(v => 
        v.status === 'Valid' || v.status === 'Approved'
      ).length;
      const successRate = totalValidations > 0 
        ? Math.round((successfulValidations / totalValidations) * 100)
        : 0;
      
      // Count total issues
      const totalIssues = validations.reduce((sum, v) => {
        return sum + (v.issues?.length || 0);
      }, 0);

      return {
        totalUploads,
        totalValidations,
        successRate,
        totalIssues,
      };
    } catch (error) {
      console.error('Failed to get stats:', error);
      return {
        totalUploads: 0,
        totalValidations: 0,
        successRate: 0,
        totalIssues: 0,
      };
    }
  },
};
