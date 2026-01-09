import { authService } from '@/services/auth';
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';

    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const pathname = window.location.pathname;
        if (pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;

