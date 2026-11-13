import { create } from 'zustand';
import apiClient from '../lib/axios';
import type {
  ApiSuccessResponse,
  Banner,
  CourseItem,
  ServiceItem,
  SiteContentMap,
  TeamMember,
} from '../types';

interface BootstrapPayload {
  contents: SiteContentMap;
  banners: Banner[];
  services: ServiceItem[];
  teamMembers: TeamMember[];
  courses?: CourseItem[];
}

interface SiteState {
  contents: SiteContentMap;
  banners: Banner[];
  services: ServiceItem[];
  teamMembers: TeamMember[];
  courses: CourseItem[];
  isLoading: boolean;
  error: string | null;
  hasLoaded: boolean;
  fetchBootstrap: (force?: boolean) => Promise<void>;
  getText: (key: string, lang?: string, fallback?: string) => string;
}

export const useSiteStore = create<SiteState>((set, get) => ({
  contents: {},
  banners: [],
  services: [],
  teamMembers: [],
  courses: [],
  isLoading: false,
  error: null,
  hasLoaded: false,

  fetchBootstrap: async (force = false) => {
    if (get().hasLoaded && !force) return;
    set({ isLoading: true, error: null });
    try {
      const res = await apiClient.get<ApiSuccessResponse<BootstrapPayload>>(
        '/content/bootstrap'
      );
      set({
        contents: res.data.data.contents || {},
        banners: res.data.data.banners || [],
        services: res.data.data.services || [],
        teamMembers: res.data.data.teamMembers || [],
        courses: res.data.data.courses || [],
        isLoading: false,
        hasLoaded: true,
      });
    } catch (err) {
      set({
        isLoading: false,
        error:
          err instanceof Error
            ? err.message
            : 'خطا در دریافت تنظیمات وب‌سایت',
      });
    }
  },

  getText: (key, lang = 'fa', fallback = '') => {
    const entry = get().contents[key];
    if (!entry) return fallback;
    if (lang.startsWith('en') && entry.en) {
      return entry.en;
    }
    return entry.fa || fallback;
  },
}));
