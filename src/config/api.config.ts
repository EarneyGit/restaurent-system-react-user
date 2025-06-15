export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://82.25.104.117:5001';
export const BASE_URL = API_BASE_URL;


console.log("API_BASE_URL",import.meta.env.VITE_APP_URL);
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  LOGOUT: '/api/auth/logout',
  GET_ME: '/api/auth/me',
  SEND_OTP: '/api/auth/send-otp',
  VERIFY_OTP: '/api/auth/verify-otp',
  FORGOT_PASSWORD_OTP: '/api/auth/forgot-password-otp',
  RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
  VERIFY_EMAIL: `${API_BASE_URL}/api/auth/verify-email`,
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
  LIST: `${API_BASE_URL}/api/products`,
  DETAILS: (id: string) => `${API_BASE_URL}/api/products/${id}`,
  CATEGORIES: `${API_BASE_URL}/api/categories`,
};

export const CATEGORY_ENDPOINTS = {
  GET_ALL_CATEGORIES: '/api/categories',
  GET_SINGLE_CATEGORY: (id: string) => `/api/categories/${id}`,
};

export const CART_ENDPOINTS = {
  // Guest Cart Endpoints
  GUEST_CART: `${API_BASE_URL}/api/cart`,
  GUEST_CART_ITEMS: `${API_BASE_URL}/api/cart/items`,
  GUEST_CART_SUMMARY: `${API_BASE_URL}/api/cart/summary`,
  GUEST_CART_MERGE: `${API_BASE_URL}/api/cart/merge`,
  GUEST_CART_DELIVERY: `${API_BASE_URL}/api/cart/delivery`,
  
  // Authenticated User Cart Endpoints
  USER_CART: `${API_BASE_URL}/api/cart`,
  USER_CART_ITEMS: `${API_BASE_URL}/api/cart/items`,
  USER_CART_SUMMARY: `${API_BASE_URL}/api/cart/summary`,
  USER_CART_DELIVERY: `${API_BASE_URL}/api/cart/delivery`,
  
  // Cart Item Operations
  ADD_ITEM: `${API_BASE_URL}/api/cart/items`,
  UPDATE_ITEM: (itemId: string) => `${API_BASE_URL}/api/cart/items/${itemId}`,
  REMOVE_ITEM: (itemId: string) => `${API_BASE_URL}/api/cart/items/${itemId}`,
  
  // Cart Management
  CLEAR_CART: `${API_BASE_URL}/api/cart`,
  CLEAR_BRANCH_CART: (branchId: string) => `${API_BASE_URL}/api/cart?branchId=${branchId}`,
};

export const USER_ENDPOINTS = {
  PROFILE: `${API_BASE_URL}/api/users/profile`,
  UPDATE_PROFILE: `${API_BASE_URL}/api/users/profile`,
  CHANGE_PASSWORD: `${API_BASE_URL}/api/users/change-password`,
  ORDERS: `${API_BASE_URL}/api/orders/myorders`,
};

export const ORDER_ENDPOINTS = {
  CREATE: '/api/orders',
  LIST: '/api/orders',
  DETAILS: (id: string) => `/api/orders/${id}`,
  MY_ORDERS: '/api/orders/myorders',
  TODAY_ORDERS: '/api/orders/today'
}; 