import { create } from 'zustand';
import { trackEvent } from '../lib/analytics';

export type ThemeMode = 'dark' | 'light';

interface ThemeState {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem('vph-theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return 'dark';
}

function applyThemeToDom(mode: ThemeMode) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', mode);
}

const initialTheme = getInitialTheme();
applyThemeToDom(initialTheme);

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initialTheme,
  setTheme: (mode) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vph-theme', mode);
    }
    applyThemeToDom(mode);
    set({ theme: mode });
  },
  toggleTheme: () => {
    const next: ThemeMode = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
    trackEvent('theme_toggle', { theme: next });
  },
}));
