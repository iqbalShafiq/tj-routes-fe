import apiClient from './client';
import { API_ENDPOINTS, STORAGE_KEYS } from '../utils/constants';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  role: 'common_user' | 'admin';
  reputation_points?: number;
  level?: 'newcomer' | 'contributor' | 'trusted' | 'expert' | 'legend';
  oauth_provider?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
  data: {
    user: User;
    access_token: string;
    refresh_token: string;
  };
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface PasswordActionResponse {
  success: boolean;
  message: string;
  error?: string;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.auth.login, data);
    if (!response.data.success) {
      const errorMessage = response.data.error || 'Login failed. Please try again.';
      throw new Error(errorMessage);
    }
    if (response.data.success && response.data.data.access_token) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.data.access_token);
      if (response.data.data.refresh_token) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.data.refresh_token);
      }
      // Normalize user role for consistency
      const user = {
        ...response.data.data.user,
        role: response.data.data.user.role === 'admin' ? 'admin' : 'common_user',
      };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    // Map 'name' to 'username' for the API
    const apiData = {
      email: data.email,
      password: data.password,
      username: data.name,
    };
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.auth.register, apiData);
    if (!response.data.success) {
      const errorMessage = response.data.error || 'Registration failed. Please try again.';
      throw new Error(errorMessage);
    }
    if (response.data.success && response.data.data.access_token) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.data.data.access_token);
      if (response.data.data.refresh_token) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.data.refresh_token);
      }
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  getToken: () => {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  isAuthenticated: () => {
    return !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  initiateOAuth: (provider: string = 'google') => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}${API_ENDPOINTS.auth.oauth(provider)}`;
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<PasswordActionResponse> => {
    const response = await apiClient.post<PasswordActionResponse>(
      API_ENDPOINTS.auth.forgotPassword,
      data
    );
    if (!response.data.success) {
      const errorMessage = response.data.error || 'Failed to send reset email. Please try again.';
      throw new Error(errorMessage);
    }
    return response.data;
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<PasswordActionResponse> => {
    const response = await apiClient.post<PasswordActionResponse>(
      API_ENDPOINTS.auth.resetPassword,
      data
    );
    if (!response.data.success) {
      const errorMessage = response.data.error || 'Failed to reset password. Please try again.';
      throw new Error(errorMessage);
    }
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<PasswordActionResponse> => {
    const response = await apiClient.post<PasswordActionResponse>(
      API_ENDPOINTS.auth.changePassword,
      data
    );
    if (!response.data.success) {
      const errorMessage = response.data.error || 'Failed to change password. Please try again.';
      throw new Error(errorMessage);
    }
    return response.data;
  },
};
