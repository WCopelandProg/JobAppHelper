import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const ACCESS_TOKEN_KEY = "jah_access_token";
const REFRESH_TOKEN_KEY = "jah_refresh_token";

export const tokenStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

export const apiClient = axios.create({
  baseURL: "/api",
});

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return null;
  try {
    const res = await axios.post("/api/auth/refresh", { refreshToken });
    const { accessToken, refreshToken: newRefreshToken } = res.data;
    tokenStorage.setTokens(accessToken, newRefreshToken);
    return accessToken;
  } catch {
    tokenStorage.clear();
    return null;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && tokenStorage.getRefreshToken()) {
      originalRequest._retry = true;
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }
      const newToken = await refreshPromise;
      if (newToken) {
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      }
      window.dispatchEvent(new CustomEvent("jah:session-expired"));
    }

    return Promise.reject(error);
  },
);

export interface ApiErrorShape {
  error?: { message?: string; details?: unknown };
}

export function extractErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as ApiErrorShape | undefined;
    if (data?.error?.message) return data.error.message;
    if (err.message) return err.message;
  }
  return fallback;
}
