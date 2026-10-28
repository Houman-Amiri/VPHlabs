import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiErrorDetail } from '../types';

export const AUTH_TOKEN_STORAGE_KEY = 'vph_auth_token';
const WINDOW_NAME_PREFIX = '__VPH_STORE__:';

function readWindowNameMap(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    if (
      typeof window.name === 'string' &&
      window.name.startsWith(WINDOW_NAME_PREFIX)
    ) {
      return JSON.parse(window.name.slice(WINDOW_NAME_PREFIX.length)) || {};
    }
  } catch {
    // Ignore malformed window.name
  }
  return {};
}

function writeWindowNameKey(key: string, value: string | null) {
  if (typeof window === 'undefined') return;
  try {
    const map = readWindowNameMap();
    if (value) {
      map[key] = value;
    } else {
      delete map[key];
    }
    const keys = Object.keys(map);
    window.name =
      keys.length > 0 ? `${WINDOW_NAME_PREFIX}${JSON.stringify(map)}` : '';
  } catch {
    // Ignore
  }
}

export function safeStorageGet(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const val = window.localStorage.getItem(key);
    if (val) return val;
  } catch {
    // localStorage may be blocked in cross-origin iframes
  }
  try {
    const val = window.sessionStorage.getItem(key);
    if (val) return val;
  } catch {
    // sessionStorage may also be blocked in strict third-party iframes
  }
  const winMap = readWindowNameMap();
  return winMap[key] || null;
}

export function safeStorageSet(key: string, value: string | null) {
  if (typeof window === 'undefined') return;
  try {
    if (value) {
      window.localStorage.setItem(key, value);
    } else {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Ignore storage restrictions
  }
  try {
    if (value) {
      window.sessionStorage.setItem(key, value);
    } else {
      window.sessionStorage.removeItem(key);
    }
  } catch {
    // Ignore storage restrictions
  }
  writeWindowNameKey(key, value);
}

export class ApiClientError extends Error {
  status: number;
  code: string;
  details?: ApiErrorDetail[];

  constructor(
    message: string,
    status = 500,
    code = 'NETWORK_ERROR',
    details?: ApiErrorDetail[]
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

let inMemoryAccessToken: string | null = safeStorageGet(AUTH_TOKEN_STORAGE_KEY);
let proxyStripsAuthHeaders = false;

export function setAuthAccessToken(token: string | null) {
  inMemoryAccessToken = token;
  if (!token) {
    proxyStripsAuthHeaders = false;
  }
  safeStorageSet(AUTH_TOKEN_STORAGE_KEY, token);
}

export function getAuthAccessToken(): string | null {
  if (inMemoryAccessToken) return inMemoryAccessToken;
  const stored = safeStorageGet(AUTH_TOKEN_STORAGE_KEY);
  if (stored) {
    inMemoryAccessToken = stored;
    return stored;
  }
  return null;
}

/**
 * Centralized Axios instance with relative `/api` baseURL,
 * Partitioned CHIPS cookie + Standard Bearer + Proxy-safe `X-VPH-Auth` header +
 * automatic proxy-strip fallback and `window.name` iframe reload persistence.
 */
export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 15000,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAuthAccessToken();
  if (token) {
    if (config.headers) {
      if (typeof config.headers.set === 'function') {
        config.headers.set('X-VPH-Auth', token);
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        config.headers['X-VPH-Auth'] = token;
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    if (proxyStripsAuthHeaders) {
      config.params = {
        ...(config.params || {}),
        _vph_auth: token,
      };
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (
    error: AxiosError<{
      error?: { code?: string; message?: string; details?: ApiErrorDetail[] };
    }>
  ) => {
    const status = error.response?.status ?? 0;
    const serverError = error.response?.data?.error;
    const activeToken = getAuthAccessToken();
    const originalConfig = error.config as
      | (InternalAxiosRequestConfig & { _retriedWithQueryAuth?: boolean })
      | undefined;

    if (
      status === 401 &&
      serverError?.code === 'UNAUTHORIZED' &&
      activeToken &&
      originalConfig &&
      !originalConfig._retriedWithQueryAuth
    ) {
      proxyStripsAuthHeaders = true;
      originalConfig._retriedWithQueryAuth = true;
      originalConfig.params = {
        ...(originalConfig.params || {}),
        _vph_auth: activeToken,
      };
      return apiClient.request(originalConfig);
    }

    if (status === 401 && serverError?.code === 'INVALID_TOKEN') {
      setAuthAccessToken(null);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('vph:auth-expired'));
      }
    }

    const normalized = new ApiClientError(
      serverError?.message ||
        (status === 0
          ? 'ارتباط با سرور برقرار نشد. وضعیت اتصال شبکه را بررسی کنید.'
          : 'خطایی در پردازش درخواست رخ داد.'),
      status,
      serverError?.code || 'REQUEST_FAILED',
      serverError?.details
    );

    return Promise.reject(normalized);
  }
);

export default apiClient;
