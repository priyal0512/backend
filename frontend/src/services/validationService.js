import api from './api';

export const validationService = {
  async validateUpload(uploadId) {
    const response = await api.post(`/api/validate/${uploadId}`);
    return response.data;
  },
};

