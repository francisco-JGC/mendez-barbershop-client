import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from '@/lib/token-storage';
import { tenantStorage } from '@/lib/tenant-storage';
import type { AuthTokens } from '@/types/auth';

export const AUTH_LOGOUT_EVENT = 'mendez:auth-logout';
export const TENANT_CODE_HEADER = 'X-Tenant-Code';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const tokens = tokenStorage.get();
  if (tokens) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }

  const tenantCode = tenantStorage.get();
  if (tenantCode) {
    config.headers[TENANT_CODE_HEADER] = tenantCode;
  }

  return config;
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const tokens = tokenStorage.get();
  if (!tokens) {
    throw new Error('No refresh token available');
  }

  const response = await axios.post<AuthTokens>(`${baseURL}/auth/refresh`, {
    refreshToken: tokens.refreshToken,
  });

  tokenStorage.set(response.data);
  return response.data.accessToken;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retried?: boolean })
      | undefined;

    const isAuthEndpoint = originalRequest?.url?.includes('/auth/');

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retried &&
      !isAuthEndpoint
    ) {
      originalRequest._retried = true;

      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        const accessToken = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch {
        tokenStorage.clear();
        window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
      }
    }

    return Promise.reject(error);
  },
);
