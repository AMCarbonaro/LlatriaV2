import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => Promise<void>;
  setTheme: (isDark: boolean) => Promise<void>;
  initializeTheme: () => Promise<void>;
}

const THEME_STORAGE_KEY = 'llatria-theme';

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: false,
  initializeTheme: async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (stored !== null) {
        const isDark = stored === 'true';
        set({ isDark });
      } else {
        // Use system preference if no stored theme
        const colorScheme = Appearance.getColorScheme();
        const isDark = colorScheme === 'dark';
        set({ isDark });
        await AsyncStorage.setItem(THEME_STORAGE_KEY, String(isDark));
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
      // Fallback to system preference
      const colorScheme = Appearance.getColorScheme();
      const isDark = colorScheme === 'dark';
      set({ isDark });
    }
  },
  toggleTheme: async () => {
    set((state) => {
      const newTheme = !state.isDark;
      AsyncStorage.setItem(THEME_STORAGE_KEY, String(newTheme)).catch(console.error);
      return { isDark: newTheme };
    });
  },
  setTheme: async (isDark: boolean) => {
    set({ isDark });
    await AsyncStorage.setItem(THEME_STORAGE_KEY, String(isDark));
  },
}));

