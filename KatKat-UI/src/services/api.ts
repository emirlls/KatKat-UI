import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { appConfig, apiRoutePrefix } from '../config/appConfig';
import { getValidAccessToken, refreshAccessToken } from './authService';
import { clearTokens } from './tokenStorage';

interface ApiEnvelope<T> {
  message: string;
  success: boolean;
  status: number;
  data: T | null;
}

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown = null) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

const httpClient = axios.create({
  baseURL: `${appConfig.apiBaseUrl}${apiRoutePrefix}`,
});

httpClient.interceptors.request.use((config) => {
  const token = getValidAccessToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

let pendingRefresh: Promise<string | null> | null = null;

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiEnvelope<unknown>>) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      pendingRefresh ??= refreshAccessToken().finally(() => {
        pendingRefresh = null;
      });
      const newToken = await pendingRefresh;
      if (newToken) {
        originalRequest.headers.set('Authorization', `Bearer ${newToken}`);
        return httpClient(originalRequest);
      }
      clearTokens();
    }

    const envelope = error.response?.data;
    throw new ApiError(envelope?.message ?? error.message, error.response?.status ?? 0, envelope?.data);
  },
);

function unwrap<T>(data: ApiEnvelope<T>): T {
  return data.data as T;
}

export const api = {
  get: async <T>(url: string, params?: Record<string, unknown>): Promise<T> =>
    unwrap<T>((await httpClient.get<ApiEnvelope<T>>(url, { params })).data),
  post: async <T>(url: string, body?: unknown): Promise<T> =>
    unwrap<T>((await httpClient.post<ApiEnvelope<T>>(url, body)).data),
  put: async <T>(url: string, body?: unknown): Promise<T> =>
    unwrap<T>((await httpClient.put<ApiEnvelope<T>>(url, body)).data),
  delete: async <T>(url: string): Promise<T> => unwrap<T>((await httpClient.delete<ApiEnvelope<T>>(url)).data),
};
