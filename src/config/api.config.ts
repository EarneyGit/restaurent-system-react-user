export const API_BASE_URL = 'http://localhost:5000';

export const AUTH_ENDPOINTS = {
  SEND_OTP: `${API_BASE_URL}/api/auth/send-otp`,
  VERIFY_OTP: `${API_BASE_URL}/api/auth/verify-otp`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  FORGOT_PASSWORD_OTP: `${API_BASE_URL}/api/auth/forgot-password-otp`,
  RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  GET_ME: `${API_BASE_URL}/api/auth/me`,
}; 