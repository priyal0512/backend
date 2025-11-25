import api from './api';

export const chatbotService = {
  async sendQuery(query) {
    const response = await api.post('/api/chatbot', { query });
    return response.data;
  },
};

