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
  // Authentication
  register: (userData) => api.post('/register/', userData),
  login: (credentials) => api.post('/login/', credentials),
  logout: () => api.post('/logout/'),
  
  // Bills - now require user_id
  getAllBills: (userId) => api.get(`/bills/?user_id=${userId}`),
  getBill: (id, userId) => api.get(`/bills/${id}/?user_id=${userId}`),
  createBill: (billData) => api.post('/bills/', billData),
  updateBill: (id, billData) => api.put(`/bills/${id}/`, billData),
  deleteBill: (id, userId) => api.delete(`/bills/${id}/?user_id=${userId}`),
  getMonthlySummary: (month, year, userId) => 
    api.get(`/bills/monthly_summary/?month=${month}&year=${year}&user_id=${userId}`),
  getYearlyOverview: (year, userId) => 
    api.get(`/bills/yearly_overview/?year=${year}&user_id=${userId}`),
};

export default api;