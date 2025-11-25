import api from './api';

export const authService = {
  async signup(name, email, password) {
    try {
      const response = await api.post('/api/signup', {
        name,
        email,
        password,
      });
      return response.data;
    } catch (error) {
      // Handle network errors and connection issues
      if (!error.response) {
        throw new Error('Unable to connect to server. Please check if the backend is running.');
      }
      throw error;
    }
  },

  async login(email, password) {
    try {
      const response = await api.post('/api/login', {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      // Handle network errors and connection issues
      if (!error.response) {
        throw new Error('Unable to connect to server. Please check if the backend is running.');
      }
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

