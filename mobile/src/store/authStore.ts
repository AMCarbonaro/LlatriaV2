import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    email: string;
    storeName: string;
  } | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

const AUTH_STORAGE_KEY = 'llatria-auth';

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  initialize: async () => {
    // Load auth state from AsyncStorage on app start
    try {
      const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const authData = JSON.parse(stored);
        set({
          isAuthenticated: authData.isAuthenticated || false,
          user: authData.user || null,
        });
      }
    } catch (e) {
      // Invalid stored data, clear it
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    }
  },
  login: async (email: string, password: string) => {
    // Mock authentication - in production, this would call an API
    // For now, accept any email/password combination
    if (email && password) {
      const user = {
        email,
        storeName: email.split('@')[0] || 'My Store',
      };
      const authData = {
        isAuthenticated: true,
        user,
      };
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      set(authData);
      return true;
    }
    return false;
  },
  logout: async () => {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    set({
      isAuthenticated: false,
      user: null,
    });
  },
}));

