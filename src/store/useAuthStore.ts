import { create } from 'zustand';
import { User } from '@/types';
import { authService } from '@/services/auth';
import { isTokenExpired } from '@/lib/jwt';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
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

  // Login and fetch user data
  login: async (token) => {
    authService.storeAuth(token);
    
    set({
      token,
      isAuthenticated: true,
    });

    // Fetch user data from /auth/me
    try {
      const user = await authService.getMe();
      set({ user });
    } catch (error) {
      console.error('Error fetching user data:', error);
      // If fails to fetch user, logout
      get().logout();
    }
  },

  // Fetch user data from backend
  fetchUser: async () => {
    try {
      const user = await authService.getMe();
      set({ user });
    } catch (error) {
      console.error('Error fetching user:', error);
      // If fails to fetch user, logout
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

  // Initialize auth from localStorage
  initAuth: async () => {
    const token = authService.getToken();
    
    if (token && !isTokenExpired(token)) {
      set({
        token,
        isAuthenticated: true,
      });

      // Fetch user data from backend
      try {
        const user = await authService.getMe();
        set({ 
          user,
          isLoading: false,
        });
      } catch (error) {
        console.error('Error fetching user on init:', error);
        // If fails to fetch user, clear auth
        authService.clearAuth();
        set({ 
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } else {
      // No token or expired
      authService.clearAuth();
      set({ isLoading: false });
    }
  },
}));

