export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
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
  token: string;
  user: User;
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