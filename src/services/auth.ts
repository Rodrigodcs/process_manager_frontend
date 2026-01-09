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

  async getMe(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  storeAuth(token: string) {
    localStorage.setItem('token', token);
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  clearAuth() {
    localStorage.removeItem('token');
  },
};

