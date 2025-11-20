import api from './api';

export const authService = {
  login: async (username, password) => {
    const response = await api.post('/login/', { username, password });
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/register/', userData);
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  },
  
  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('user'));
  },
  
  setAuthToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Token ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }
};

// Set token if exists
const token = localStorage.getItem('token');
if (token) {
  authService.setAuthToken(token);
}