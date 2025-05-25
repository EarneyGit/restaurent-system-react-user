export const API_BASE_URL = 'http://localhost:5000';

export const AUTH_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  GET_ME: '/api/auth/me',
  SEND_OTP: '/api/auth/send-otp',
  VERIFY_OTP: '/api/auth/verify-otp',
  FORGOT_PASSWORD_OTP: '/api/auth/forgot-password-otp',
  RESET_PASSWORD: '/api/auth/reset-password',
};

export const BRANCH_ENDPOINTS = {
  GET_ALL_BRANCHES: '/api/branches',
  GET_MY_BRANCH: '/api/branches/my-branch',
};

export const PRODUCT_ENDPOINTS = {
  GET_ALL_PRODUCTS: '/api/products',
  GET_SINGLE_PRODUCT: (id: string) => `/api/products/${id}`,
  GET_POPULAR_PRODUCTS: '/api/products/popular',
  GET_RECOMMENDED_PRODUCTS: '/api/products/recommended',
};

export const CATEGORY_ENDPOINTS = {
  GET_ALL_CATEGORIES: '/api/categories',
  GET_SINGLE_CATEGORY: (id: string) => `/api/categories/${id}`,
}; 