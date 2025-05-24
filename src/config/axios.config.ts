import axios from 'axios';
import { API_BASE_URL } from './api.config';

// Set default base URL
axios.defaults.baseURL = API_BASE_URL;

// Add request interceptor
axios.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    console.log('Request interceptor - Token:', token);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Request interceptor - Setting Authorization header:', config.headers.Authorization);
    } else {
      console.log('Request interceptor - No token found');
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
axios.interceptors.response.use(
  (response) => {
    console.log('Response interceptor - Status:', response.status);
    return response;
  },
  (error) => {
    console.error('Response interceptor error:', error);
    
    // Only handle 401 errors that are not from the login or GET_ME endpoints
    if (error.response?.status === 401 && 
        !error.config.url?.includes('/login') && 
        !error.config.url?.includes('/me')) {
      console.log('Response interceptor - Unauthorized access, clearing token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axios; 