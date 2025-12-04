import { create } from 'zustand';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: false,
  toggleTheme: () => set((state) => {
    const newTheme = !state.isDark;
    document.documentElement.classList.toggle('dark', newTheme);
    localStorage.setItem('llatria-theme', String(newTheme));
    return { isDark: newTheme };
  }),
  setTheme: (isDark: boolean) => set(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('llatria-theme', String(isDark));
    return { isDark };
  }),
}));

