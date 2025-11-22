import api from './api';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

const authService = {
  register: (data) => api.post('/register/', data),

  login: async (credentials) => {
    const res = await api.post('/login/', credentials);
    const { token, user } = res.data || {};
    if (token) {
      authService.setToken(token);
      authService.setUser(user || null);
      authService.setAuthHeader(token);
    }
    return res;
  },

  setToken: (token) => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  },

  getToken: () => localStorage.getItem(TOKEN_KEY),

  setUser: (user) => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  },

  getUser: () => {
    const s = localStorage.getItem(USER_KEY);
    return s ? JSON.parse(s) : null;
  },

  logout: () => {
    authService.setToken(null);
    authService.setUser(null);
    delete api.defaults.headers.common['Authorization'];
  },

  setAuthHeader: (token) => {
    if (token) api.defaults.headers.common['Authorization'] = 'Token ' + token;
  },

  init: () => {
    const token = authService.getToken();
    if (token) authService.setAuthHeader(token);
  },

  isAuthenticated: () => !!authService.getToken(),
};

authService.init();

export default authService;
