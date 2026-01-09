import { create } from 'zustand';
import { User } from '@/types';
import { authService } from '@/services/auth';
import { isTokenExpired } from '@/lib/jwt';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (token: string) => Promise<void>;
  logout: () => void;
  initAuth: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user }),
  
  setToken: (token) => set({ token, isAuthenticated: !!token }),

  login: async (token) => {
    authService.storeAuth(token);
    
    set({
      token,
      isAuthenticated: true,
    });

    try {
      const user = await authService.getMe();
      set({ user });
    } catch (error) {
      console.error('Error fetching user data:', error);
      get().logout();
    }
  },

  fetchUser: async () => {
    try {
      const user = await authService.getMe();
      set({ user });
    } catch (error) {
      console.error('Error fetching user:', error);
      get().logout();
    }
  },

  logout: () => {
    authService.clearAuth();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  initAuth: async () => {
    const token = authService.getToken();
    
    if (token && !isTokenExpired(token)) {
      set({
        token,
        isAuthenticated: true,
      });

      try {
        const user = await authService.getMe();
        set({ 
          user,
          isLoading: false,
        });
      } catch (error) {
        console.error('Error fetching user on init:', error);
        authService.clearAuth();
        set({ 
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } else {
      authService.clearAuth();
      set({ isLoading: false });
    }
  },
}));

