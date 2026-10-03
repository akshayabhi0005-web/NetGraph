import axios from 'axios';

// Configurable API base URL through environment variables for future FastAPI backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to attach JWT token when backend is connected
apiClient.interceptors.request.use(
  (config) => {
    const userStr = localStorage.getItem('netgraph_auth_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (e) {
        // Ignore JSON error
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // In frontend-only mock phase, log network errors gracefully
    if (error.code === 'ERR_NETWORK') {
      console.warn('Backend server not reachable; operating in verified frontend mock mode.');
    }
    return Promise.reject(error);
  }
);
