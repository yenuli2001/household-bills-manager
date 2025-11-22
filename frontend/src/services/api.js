import axios from 'axios';

const API_BASE_URL = 'https://household-bills-manager-production.up.railway.app/api';

console.log('API URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true, // Important for session cookies
});

// Add request interceptor to include CSRF token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: (userData) => api.post('/register/', userData),
  login: (credentials) => api.post('/login/', credentials),
  logout: () => api.post('/logout/'),
  getProfile: () => api.get('/profile/'),
  updateProfile: (profileData) => api.put('/profile/', profileData),
};

export const billService = {
  getAllBills: () => api.get('/bills/'),
  getBill: (id) => api.get(`/bills/${id}/`),
  createBill: (billData) => api.post('/bills/', billData),
  updateBill: (id, billData) => api.put(`/bills/${id}/`, billData),
  deleteBill: (id) => api.delete(`/bills/${id}/`),
  getMonthlySummary: (month, year) => 
    api.get(`/bills/monthly_summary/?month=${month}&year=${year}`),
  getYearlyOverview: (year) => 
    api.get(`/bills/yearly_overview/?year=${year}`),
};

export default api;