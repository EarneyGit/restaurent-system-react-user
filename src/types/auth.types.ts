export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: string;
  permissions: string[];
  emailVerified?: boolean;
  isActive?: boolean;
  createdAt?: string;
}

export interface RegistrationData {
  email: string;
  token: string;
  password: string;
  name: string;
  phone: string;
  address: string;
  roleId?: string;
}

export interface ResetPasswordData {
  password: string;
  confirmPassword: string;
  token: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  data?: User;
}

export interface OTPResponse {
  success: boolean;
  message: string;
  token?: string;
}

export interface AxiosError {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
    status?: number;
  };
  message: string;
} 