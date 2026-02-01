import axios from 'axios';

const API_BASE_URL = 'https://household-bills-manager-backend.vercel.app/api';

console.log('API URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/#/login';
        return Promise.reject(refreshError);
      }
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

export default api;