import axios from 'axios';

const API_BASE_URL = 'https://household-bills-manager-production.up.railway.app/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,  // Important for sessions
});

// Auth functions
export const authService = {
  register: (userData) => api.post('/register/', userData),
  login: (credentials) => api.post('/login/', credentials),
  logout: () => api.post('/logout/'),
  checkAuth: () => api.get('/check-auth/'),
};

// Bill functions
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

// Check if user is authenticated
export const isAuthenticated = async () => {
  try {
    const response = await authService.checkAuth();
    return response.data.authenticated;
  } catch (error) {
    return false;
  }
};

export default api;