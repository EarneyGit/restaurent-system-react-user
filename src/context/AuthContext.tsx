import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "../config/axios.config";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { User, RegistrationData, ResetPasswordData, AuthResponse, OTPResponse } from "../types/auth.types";
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
      
      if (response.data.success && response.data.user) {
        console.log('User details fetched:', response.data.user);
        setUser(response.data.user);
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
      const token = localStorage.getItem('token');
      console.log('Checking auth with token:', token);
      
      if (token) {
        // Set token in axios headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log('Set Authorization header:', axios.defaults.headers.common['Authorization']);
        
        const success = await fetchUserDetails(token);
        console.log('Initial fetch user details success:', success);
        
        if (!success) {
          handleLogout();
        }
      } else {
        console.log('No token found in localStorage');
        setUser(null);
      }
      setIsLoading(false);
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
      console.log('Attempting login with:', { email, password: '****' });
      
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
      
      console.log('Login response:', response.data);
      
      // Check if login was successful and we have a token
      if (response.data.success && response.data.token) {
        console.log('Login successful, setting token:', response.data.token);
        
        // Store token first
        localStorage.setItem('token', response.data.token);
        
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

        // Set user data immediately if available in login response
        if (response.data.user) {
          console.log('Setting user from login response:', response.data.user);
          setUser(response.data.user);
          return;
        }

        // If no user data in login response, fetch it
        console.log('Fetching user details after login');
        const userResponse = await axios.get<AuthResponse>(AUTH_ENDPOINTS.GET_ME);
        
        if (userResponse.data.success && userResponse.data.user) {
          console.log('Setting user from GET_ME:', userResponse.data.user);
          setUser(userResponse.data.user);
          return;
        }

        // If we still don't have user data, throw error
        throw new Error('Failed to get user details');
      }
      
      // If we get here, something went wrong
      throw new Error(response.data.message || 'Login failed');
    } catch (error) {
      console.error('Login error:', error);
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
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to send OTP';
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
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'OTP verification failed';
      toast.error(message);
      throw error;
    }
  };

  const completeRegistration = async (data: RegistrationData) => {
    try {
      const response = await axios.post<AuthResponse>(AUTH_ENDPOINTS.REGISTER, data);
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user || null);
        toast.success(response.data.message || 'Registration successful');
        return;
      }
      throw new Error(response.data.message || 'Registration failed');
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
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
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to send reset OTP';
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
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'OTP verification failed';
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
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Password reset failed';
      toast.error(message);
      throw error;
    }
  };

  const getMe = async (): Promise<User | null> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('GetMe - No token found');
        return null;
      }

      // Ensure token is in headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const response = await axios.get<AuthResponse>(AUTH_ENDPOINTS.GET_ME);
      console.log('GetMe - Response:', response.data);

      if (response.data.success && response.data.user) {
        console.log('GetMe - Setting user:', response.data.user);
        setUser(response.data.user);
        return response.data.user;
      }

      // If we get here but have a successful response, keep the token
      if (response.data.success) {
        console.log('GetMe - Successful response but no user data');
        return null;
      }

      // Only clear auth state if the response indicates failure
      console.log('GetMe - Failed response, clearing auth state');
      handleLogout();
      return null;
    } catch (error) {
      console.error('GetMe error:', error);
      // Only clear auth state for specific error cases
      if (axios.isAxiosError(error) && error.response?.status === 401) {
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