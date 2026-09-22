import axios from 'axios';

const configuredApiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const apiBaseUrl = configuredApiUrl
  ? configuredApiUrl.endsWith('/api')
    ? configuredApiUrl
    : `${configuredApiUrl}/api`
  : '/api';

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT Bearer token from localStorage to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('workflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to format error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred.';
    const customErr = new Error(message);
    if (error.response?.data) {
      customErr.response = error.response;
      customErr.data = error.response.data;
      customErr.emailUnverified = error.response.data.emailUnverified;
      customErr.status = error.response.status;
    }
    return Promise.reject(customErr);
  }
);

export default api;
