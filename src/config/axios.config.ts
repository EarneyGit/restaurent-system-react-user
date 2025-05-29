import axios from 'axios';
import { API_BASE_URL } from './api.config';

// Set default base URL
axios.defaults.baseURL = API_BASE_URL;

// Add request interceptor
axios.interceptors.request.use(
  (config) => {
    // Get branchId from localStorage
    const branchId = localStorage.getItem('selectedBranchId');
    
    // Add branchId to query params for GET requests if not already present
    // and if the request is not for branch-related or orders endpoints
    if (config.method === 'get' && 
        branchId && 
        !config.url?.includes('/branches') && 
        !config.url?.includes('/orders') &&  // Exclude orders endpoint
        !config.params?.branchId) {
      config.params = {
        ...config.params,
        branchId: branchId,
      };
    }

    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle branch selection errors
    if (error.response?.status === 400 && error.response?.data?.message?.includes('Branch ID is required')) {
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/outlet-selection')) {
        window.location.href = '/outlet-selection';
      }
    }
    
    // Handle unauthorized errors
    if (error.response?.status === 401) {
      // Don't clear token for login attempts or token verification
      const isAuthEndpoint = 
        error.config.url?.includes('/login') || 
        error.config.url?.includes('/me') ||
        error.config.url?.includes('/verify');
        
      if (!isAuthEndpoint) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axios; 