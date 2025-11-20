import axios from 'axios';

const API_BASE_URL = 'https://household-bills-manager-production.up.railway.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
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
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/#/login';
    }
    return Promise.reject(error);
  }
);

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

export { authService } from './auth';
export default api;