import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiErrorDetail } from '../types';

export const AUTH_TOKEN_STORAGE_KEY = 'vph_auth_token';

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

let inMemoryAccessToken: string | null =
  typeof window !== 'undefined'
    ? localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
    : null;

export function setAuthAccessToken(token: string | null) {
  inMemoryAccessToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    }
  }
}

export function getAuthAccessToken(): string | null {
  if (inMemoryAccessToken) return inMemoryAccessToken;
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    if (stored) {
      inMemoryAccessToken = stored;
      return stored;
    }
  }
  return null;
}

/**
 * Centralized Axios instance with relative `/api` baseURL,
 * credentialed httpOnly cookie support + persistent Bearer token fallback
 * (guaranteeing reliable auth even inside cross-origin preview iframes).
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
  if (token && config.headers) {
    if (typeof config.headers.set === 'function') {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (
    error: AxiosError<{
      error?: { code?: string; message?: string; details?: ApiErrorDetail[] };
    }>
  ) => {
    const status = error.response?.status ?? 0;
    const serverError = error.response?.data?.error;

    if (status === 401 && serverError?.code === 'INVALID_TOKEN') {
      setAuthAccessToken(null);
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
