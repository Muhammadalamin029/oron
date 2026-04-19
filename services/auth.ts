import { apiClient } from '@/lib/api';
import { User, UserCreate, UserLogin, AuthResponse } from '@/types/api';

export const authApi = {
  // Register a new user
  register: async (userData: UserCreate): Promise<User> => {
    const response = await apiClient.post<User>('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials: UserLogin): Promise<AuthResponse> => {
    // FastAPI OAuth2PasswordRequestForm expects form data
    const formData = {
      username: credentials.email,
      password: credentials.password,
    };
    const response = await apiClient.postForm<AuthResponse>('/auth/login', formData);
    return response.data;
  },

  // Get current user profile
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  verifyEmail: async (token: string): Promise<{ msg: string }> => {
    const response = await apiClient.get<{ msg: string }>(`/auth/verify-email`, { token });
    return response.data;
  },

  // Logout user
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  // Refresh access token
  refreshToken: async (refresh_token: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/refresh', { refresh_token });
    return response.data;
  },
};
