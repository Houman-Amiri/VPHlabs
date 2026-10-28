import { create } from 'zustand';
import apiClient, {
  getAuthAccessToken,
  setAuthAccessToken,
} from '../lib/axios';
import type { ApiSuccessResponse, AuthUser } from '../types';

const SESSION_HINT_KEY = 'vph_session_active';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  checkSession: (force?: boolean) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isInitialized: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await apiClient.post<
        ApiSuccessResponse<{ user: AuthUser; token: string }>
      >('/auth/login', { email, password });

      const { user, token } = res.data.data;
      setAuthAccessToken(token);
      if (typeof window !== 'undefined') {
        localStorage.setItem(SESSION_HINT_KEY, '1');
      }
      set({ user, isLoading: false, isInitialized: true });
      return user;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Clear local session regardless of network response
    }
    setAuthAccessToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_HINT_KEY);
    }
    set({ user: null, isInitialized: true });
  },

  checkSession: async (force = false) => {
    if (get().isInitialized && !force) return;

    const existingToken = getAuthAccessToken();
    const hasSessionHint =
      Boolean(existingToken) ||
      (typeof window !== 'undefined' &&
        localStorage.getItem(SESSION_HINT_KEY) === '1');

    if (!hasSessionHint && !force) {
      set({ user: null, isInitialized: true, isLoading: false });
      return;
    }

    set({ isLoading: true });
    try {
      const res = await apiClient.get<ApiSuccessResponse<{ user: AuthUser }>>(
        '/auth/me'
      );
      set({
        user: res.data.data.user,
        isLoading: false,
        isInitialized: true,
      });
    } catch {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(SESSION_HINT_KEY);
      }
      setAuthAccessToken(null);
      set({ user: null, isLoading: false, isInitialized: true });
    }
  },
}));
