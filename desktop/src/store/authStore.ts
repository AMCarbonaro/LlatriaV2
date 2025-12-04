import { create } from 'zustand';
import { apiClient } from '@/services/api';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    name?: string;
    storeName: string;
  } | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  initialize: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  
  initialize: async () => {
    // Check if we have tokens and verify they're valid
    const hasAuth = await get().checkAuth();
    if (!hasAuth) {
      // Clear invalid tokens
      apiClient.clearTokens();
      set({ isAuthenticated: false, user: null });
    }
  },

  checkAuth: async () => {
    try {
      const response = await apiClient.getMe();
      if (response.success && response.data?.user) {
        const user = response.data.user;
        set({
          isAuthenticated: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            storeName: user.name || user.email.split('@')[0] || 'My Store',
          },
        });
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  },

  login: async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);
      
      if (response.success && response.data) {
        const user = response.data.user;
        set({
          isAuthenticated: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            storeName: user.name || user.email.split('@')[0] || 'My Store',
          },
        });
        return { success: true };
      }
      
      return {
        success: false,
        error: response.error || 'Login failed',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Login failed',
      };
    }
  },

  register: async (email: string, password: string, name?: string) => {
    try {
      const response = await apiClient.register(email, password, name);
      
      if (response.success && response.data) {
        // Auto-login after registration
        const loginResponse = await apiClient.login(email, password);
        if (loginResponse.success && loginResponse.data) {
          const user = loginResponse.data.user;
          set({
            isAuthenticated: true,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              storeName: user.name || user.email.split('@')[0] || 'My Store',
            },
          });
          return { success: true };
        }
      }
      
      return {
        success: false,
        error: response.error || 'Registration failed',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Registration failed',
      };
    }
  },

  logout: () => {
    apiClient.logout();
    set({
      isAuthenticated: false,
      user: null,
    });
  },
}));

