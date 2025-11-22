import axios from 'axios';

// Direct URL to your working backend
const API_BASE_URL = 'https://household-bills-manager-production.up.railway.app/api';

console.log('API URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

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

export const authService = {
  register: (payload) => api.post('/auth/register/', payload),
  login: (payload) => api.post('/auth/login/', payload),
  logout: () => api.post('/auth/logout/'),
  setAuthToken: (token) => {
    if (token) api.defaults.headers.common['Authorization'] = `Token ${token}`;
  },
  clearAuthToken: () => {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const getCurrentUser = () => api.get('/auth/me/');

export default api;