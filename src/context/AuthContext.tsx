import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "../config/axios.config";
import { useNavigate } from "react-router-dom";
import { toast } from 'sonner';
import { User, RegistrationData, ResetPasswordData, AuthResponse, OTPResponse, AxiosError } from "../types/auth.types";
import { AUTH_ENDPOINTS } from "../config/api.config";

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  isLoading: boolean;
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleAuthError = (error: unknown) => {
    const axiosError = error as AxiosError;
    const message = axiosError.response?.data?.message || axiosError.message || 'Authentication failed';
    setError(message);
    toast.error(message);
  };

  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const userData = JSON.parse(storedUser) as User;
          setToken(storedToken);
          setUser(userData);
          setIsAuthenticated(true);
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const fetchUserDetails = async (token: string) => {
    try {
      console.log('Fetching user details with token:', token);
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const response = await axios.get<{ success: boolean; data: User }>(AUTH_ENDPOINTS.GET_ME);
      console.log('GET_ME response:', response);
      
      if (response.data.success && response.data.data) {
        console.log('User details fetched:', response.data.data);
        setUser(response.data.data);
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

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        const response = await axios.get<{ success: boolean; data: User }>(AUTH_ENDPOINTS.GET_ME);
        
        if (response.data.success && response.data.data) {
          console.log('User data fetched successfully:', response.data.data);
          setUser(response.data.data);
        } else {
          console.log('Failed to fetch user data - no user in response');
          setUser(null);
        }
      } catch (error) {
        console.error('Error during auth check:', error);
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
    localStorage.removeItem('user');
    localStorage.removeItem('guestSessionId');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    setToken(null);
    toast.success('Logged out successfully');
  };

  const handleAuthResponse = (response: { token: string; user: User }) => {
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      setToken(response.token);
      setIsAuthenticated(true);
    }
  };

  const login = async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await axios.post<LoginResponse>(AUTH_ENDPOINTS.LOGIN, { email, password });
      const { token: newToken, user: userData } = response.data;

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));

      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);

      // Get the redirect path
      const branchId = localStorage.getItem('branchId');
      const returnUrl = localStorage.getItem('returnUrl');
      const isGuest = localStorage.getItem('isGuest') === 'true';
      
      // Clear guest status if it exists
      if (isGuest) {
        localStorage.removeItem('isGuest');
        localStorage.removeItem('guestSessionId');
      }
      
      // Determine redirect path
      let redirectPath = '/app';
      if (!branchId && returnUrl && !isGuest) {
        redirectPath = returnUrl;
      }
      
      localStorage.removeItem('returnUrl'); // Clear the returnUrl after using it
      
      // Use window.location.href for consistent behavior
      window.location.href = redirectPath;

      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Login failed. Please try again.');
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.get<{ success: boolean }>(AUTH_ENDPOINTS.LOGOUT);
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      handleLogout();
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

  const completeRegistration = async (data: RegistrationData): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.post<{ success: boolean; token: string; user: User }>(AUTH_ENDPOINTS.REGISTER, data);
      handleAuthResponse(response.data);
    } catch (error) {
      handleAuthError(error);
      throw error;
    } finally {
      setIsLoading(false);
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
      const response = await axios.post<{ success: boolean; message: string }>(AUTH_ENDPOINTS.RESET_PASSWORD, data);
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
      setIsLoading(true);
      setError(null);
      const response = await axios.get<{ success: boolean; data: User }>(AUTH_ENDPOINTS.GET_ME);
      setUser(response.data.data);
      return response.data.data;
    } catch (error) {
      handleAuthError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    token,
    user,
    login,
    logout,
    isLoading,
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