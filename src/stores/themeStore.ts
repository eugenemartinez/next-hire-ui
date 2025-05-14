import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void; // Simple toggle between light and dark
}

const getInitialSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
          theme: 'light', // Default to 'light'
      setTheme: (newTheme) => {
        set({ theme: newTheme });
      },
      toggleTheme: () => {
        const currentTheme = get().theme;
        let effectiveTheme = currentTheme;
        if (currentTheme === 'system') {
          effectiveTheme = getInitialSystemTheme();
        }
        
        // Toggle based on the effective theme
        set({ theme: effectiveTheme === 'light' ? 'dark' : 'light' });
      },
    }),
    {
      name: 'nexthire-theme-storage', // Unique name for localStorage
    }
  )
);

// Helper function to apply the theme class to the document
export const applyThemeToDocument = (themePreference: Theme) => {
  const root = document.documentElement;
  let themeToApply: 'light' | 'dark';

  if (themePreference === 'system') {
    themeToApply = getInitialSystemTheme();
  } else {
    themeToApply = themePreference;
  }

  root.classList.remove('light', 'dark'); // Remove any existing theme class
  if (themeToApply === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.add('light'); // Explicitly add light or rely on default
  }
};

export default useThemeStore;