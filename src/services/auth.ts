import api from '@/lib/axios';
import { SignInDto, SignUpDto, AuthResponse, User } from '@/types';

export const authService = {
  async signIn(data: SignInDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/sign-in', data);
    return response.data;
  },

  async signUp(data: SignUpDto): Promise<User> {
    const response = await api.post<User>('/auth/sign-up', data);
    return response.data;
  },

  // Get current user data from backend
  async getMe(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  // Helper to store auth data
  storeAuth(token: string) {
    localStorage.setItem('token', token);
  },

  // Helper to get token
  getToken(): string | null {
    return localStorage.getItem('token');
  },

  // Helper to remove auth data
  clearAuth() {
    localStorage.removeItem('token');
  },
};

