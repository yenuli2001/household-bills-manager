import axios from 'axios';

const API_BASE_URL = 'https://household-bills-manager-backend.vercel.app/api';

// ─── Axios instance ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
  withCredentials: true, // always send the HttpOnly refresh cookie
});

// ─── Token provider ───────────────────────────────────────────────────────────
// api.js cannot import useAuth (hook) directly, so AuthContext registers a getter
// here after it mounts. This keeps the access token out of localStorage.
let _getAccessToken = () => localStorage.getItem('access_token'); // fallback during init

export function registerTokenGetter(fn) {
  _getAccessToken = fn;
}

// ─── Request interceptor — attach access token from memory ───────────────────
api.interceptors.request.use(
  (config) => {
    const token = _getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor — silent refresh on 401 ────────────────────────────
let _isRefreshing = false;
let _refreshQueue = []; // queue of { resolve, reject } waiting for new token

function processQueue(error, token = null) {
  _refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  _refreshQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401, and only once per request
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // If a refresh is already in-flight, queue this request
    if (_isRefreshing) {
      return new Promise((resolve, reject) => {
        _refreshQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      }).catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    _isRefreshing = true;

    try {
      // Use the HttpOnly cookie — no body needed
      const response = await axios.post(
        `${API_BASE_URL}/auth/refresh/`,
        null,
        { withCredentials: true }
      );

      const { access } = response.data;

      // Update the in-memory getter if AuthContext registered one
      // (AuthContext will call silentRefresh which updates its own ref;
      //  here we just keep going with the new token for queued requests)
      processQueue(null, access);

      originalRequest.headers.Authorization = `Bearer ${access}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);

      // Refresh failed — force logout
      localStorage.removeItem('user');
      window.location.href = '/#/login';
      return Promise.reject(refreshError);
    } finally {
      _isRefreshing = false;
    }
  }
);

// ─── Bill service ─────────────────────────────────────────────────────────────
export const billService = {
  getAllBills:       ()               => api.get('/bills/'),
  getBill:          (id)             => api.get(`/bills/${id}/`),
  createBill:       (billData)       => api.post('/bills/', billData),
  updateBill:       (id, billData)   => api.put(`/bills/${id}/`, billData),
  deleteBill:       (id)             => api.delete(`/bills/${id}/`),
  getMonthlySummary:(month, year)    => api.get(`/bills/monthly_summary/?month=${month}&year=${year}`),
  getYearlyOverview:(year)           => api.get(`/bills/yearly_overview/?year=${year}`),
};

export default api;