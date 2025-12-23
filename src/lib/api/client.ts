import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../utils/constants';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      // Ensure headers object exists
      if (!config.headers) {
        config.headers = {};
      }
      // Set Authorization header - handle both plain objects and AxiosHeaders
      if (typeof config.headers === 'object' && config.headers !== null) {
        if ('set' in config.headers && typeof (config.headers as any).set === 'function') {
          // AxiosHeaders instance
          (config.headers as any).set('Authorization', `Bearer ${token}`);
        } else {
          // Plain object
          (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const requestUrl = error.config?.url || '';
      
      // Don't redirect for auth endpoints (login/register)
      const isAuthEndpoint = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');
      
      // Only redirect if we have a token (meaning we thought we were authenticated)
      // If no token, the 401 is expected for public endpoints or auth failures
      if (token && !isAuthEndpoint) {
        // Clear auth data on unauthorized
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        // Redirect to login if not already there
        if (window.location.pathname !== '/auth/login' && window.location.pathname !== '/auth/register') {
          // Use a small delay to avoid race conditions with navigation
          setTimeout(() => {
            window.location.href = '/auth/login';
          }, 100);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

