import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "../config/axios.config";
import { useNavigate } from "react-router-dom";
import { toast } from 'sonner';
import { User, RegistrationData, ResetPasswordData, AuthResponse, OTPResponse, AxiosError } from "../types/auth.types";
import { AUTH_ENDPOINTS } from "../config/api.config";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  sendRegistrationOTP: (email: string) => Promise<void>;
  verifyRegistrationOTP: (email: string, otp: string) => Promise<string>;
  completeRegistration: (data: RegistrationData) => Promise<void>;
  sendPasswordResetOTP: (email: string) => Promise<void>;
  verifyResetOTP: (email: string, otp: string) => Promise<string>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  getMe: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserDetails = async (token: string) => {
    try {
      console.log('Fetching user details with token:', token);
      
      // Ensure token is in headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const response = await axios.get<AuthResponse>(AUTH_ENDPOINTS.GET_ME);
      console.log('GET_ME response:', response);
      
      if (response.data.success && response.data) {
        console.log('User details fetched:', response.data);
        setUser(response?.data);
        return true;
      }
      
      console.log('Failed to fetch user details - no user data in response');
      return false;
    } catch (error) {
      console.error('Error fetching user details:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        handleLogout();
      }
      return false;
    }
  };

  // Check authentication status on mount and token change
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Checking auth with token:', token);
        
        if (!token) {
          console.log('No token found in localStorage');
          setUser(null);
          setIsLoading(false);
          return;
        }

        // Set token in axios headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        const response = await axios.get<AuthResponse>(AUTH_ENDPOINTS.GET_ME);
        
        if (response.data.success && response.data.data) {
          console.log('User data fetched successfully:', response.data.data);
          setUser(response.data.data);
        } else {
          console.log('Failed to fetch user data - no user in response');
          setUser(null);
        }
      } catch (error) {
        console.error('Error during auth check:', error);
        // Only clear token for 401/403 errors
        if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
          handleLogout();
        }
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const handleLogout = () => {
    console.log('Handling logout');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const login = async (email: string, password: string) => {
    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Clear any existing auth state before login attempt
      handleLogout();

      // Prepare login data
      const loginData = {
        email: email.trim(),
        password: password.trim()
      };

      // Make the login request
      const response = await axios.post<AuthResponse>(
        AUTH_ENDPOINTS.LOGIN,
        loginData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Check if login was successful and we have a token
      if (response.data.success && response.data.token) {
        // Store token first
        localStorage.setItem('token', response.data.token);
        
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

        // Set user data immediately if available in login response
        if (response.data.data) {
          setUser(response.data.data);
          return;
        }

        // If no user data in login response, fetch it
        const userResponse = await axios.get<AuthResponse>(AUTH_ENDPOINTS.GET_ME);
        
        if (userResponse.data.success && userResponse.data.data) {
          setUser(userResponse.data.data);
          return;
        }

        // If we still don't have user data, throw error
        throw new Error('Failed to get user details');
      }
      
      // If we get here, something went wrong
      throw new Error(response.data.message || 'Login failed');
    } catch (error) {
      handleLogout(); // Clear any partial auth state
      
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
        toast.error(errorMessage || 'Login failed');
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unexpected error occurred');
      }
      
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.get<AuthResponse>(AUTH_ENDPOINTS.LOGOUT);
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      handleLogout();
      toast.success('Logged out successfully');
    }
  };

  const sendRegistrationOTP = async (email: string) => {
    try {
      const response = await axios.post<OTPResponse>(AUTH_ENDPOINTS.SEND_OTP, { email });
      if (response.data.success) {
        toast.success(response.data.message || 'OTP sent successfully');
        return;
      }
      throw new Error(response.data.message || 'Failed to send OTP');
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const message = axiosError.response?.data?.message || axiosError.message || 'Failed to send OTP';
      toast.error(message);
      throw error;
    }
  };

  const verifyRegistrationOTP = async (email: string, otp: string) => {
    try {
      const response = await axios.post<OTPResponse>(AUTH_ENDPOINTS.VERIFY_OTP, { email, otp });
      if (response.data.success && response.data.token) {
        toast.success(response.data.message || 'OTP verified successfully');
        return response.data.token;
      }
      throw new Error(response.data.message || 'OTP verification failed');
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const message = axiosError.response?.data?.message || axiosError.message || 'OTP verification failed';
      toast.error(message);
      throw error;
    }
  };

  const completeRegistration = async (data: RegistrationData) => {
    try {
      const response = await axios.post<AuthResponse>(AUTH_ENDPOINTS.REGISTER, data);
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.data || null);
        toast.success(response.data.message || 'Registration successful');
        return;
      }
      throw new Error(response.data.message || 'Registration failed');
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const message = axiosError.response?.data?.message || axiosError.message || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const sendPasswordResetOTP = async (email: string) => {
    try {
      const response = await axios.post<OTPResponse>(AUTH_ENDPOINTS.FORGOT_PASSWORD_OTP, { email });
      if (response.data.success) {
        toast.success(response.data.message || 'Password reset OTP sent');
        return;
      }
      throw new Error(response.data.message || 'Failed to send reset OTP');
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const message = axiosError.response?.data?.message || axiosError.message || 'Failed to send reset OTP';
      toast.error(message);
      throw error;
    }
  };

  const verifyResetOTP = async (email: string, otp: string) => {
    try {
      const response = await axios.post<OTPResponse>(AUTH_ENDPOINTS.VERIFY_OTP, { email, otp });
      if (response.data.success && response.data.token) {
        toast.success(response.data.message || 'OTP verified successfully');
        return response.data.token;
      }
      throw new Error(response.data.message || 'OTP verification failed');
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const message = axiosError.response?.data?.message || axiosError.message || 'OTP verification failed';
      toast.error(message);
      throw error;
    }
  };

  const resetPassword = async (data: ResetPasswordData) => {
    try {
      const response = await axios.post<AuthResponse>(AUTH_ENDPOINTS.RESET_PASSWORD, data);
      if (response.data.success) {
        toast.success(response.data.message || 'Password reset successful');
        return;
      }
      throw new Error(response.data.message || 'Password reset failed');
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const message = axiosError.response?.data?.message || axiosError.message || 'Password reset failed';
      toast.error(message);
      throw error;
    }
  };

  const getMe = async (): Promise<User | null> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return null;
      }

      // Ensure token is in headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const response = await axios.get<AuthResponse>(AUTH_ENDPOINTS.GET_ME);

      if (response.data.success && response.data.data) {
        setUser(response.data.data);
        return response.data.data;
      }

      return null;
    } catch (error) {
      console.error('GetMe error:', error);
      // Only clear auth state for 401/403 errors
      if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
        handleLogout();
      }
      return null;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    sendRegistrationOTP,
    verifyRegistrationOTP,
    completeRegistration,
    sendPasswordResetOTP,
    verifyResetOTP,
    resetPassword,
    getMe
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 