import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token from localStorage if available (dual support: cookie + Bearer token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eventhub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized, token may be expired
    if (error.response && error.response.status === 401) {
      // Ignore 401 on /auth/me during initial page load
      if (!error.config.url.includes('/auth/me')) {
        console.warn('Unauthorized request');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
