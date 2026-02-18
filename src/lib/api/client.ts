import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/lib/store/auth.store';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// BUG-001 FIX: Shared proactive-refresh promise so all concurrent requests on
// page reload wait for one refresh cycle instead of each getting a 401 first.
let proactiveRefreshPromise: Promise<string | null> | null = null;

// Request interceptor: attach auth token, proactively refresh when needed
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  // Skip proactive refresh for login/refresh endpoints to avoid recursion
  if (config.url?.includes('/auth/login') || config.url?.includes('/auth/refresh')) {
    return config;
  }

  const { accessToken, refreshToken } = useAuthStore.getState();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  }

  // No accessToken (e.g. page reload — accessToken is not persisted) but we
  // have a refreshToken: refresh proactively so requests don't need a 401 round-trip.
  if (refreshToken) {
    if (!proactiveRefreshPromise) {
      proactiveRefreshPromise = axios
        .post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, { refreshToken })
        .then((res) => {
          useAuthStore.getState().updateTokens(res.data.accessToken, res.data.refreshToken);
          return res.data.accessToken as string;
        })
        .catch(() => {
          useAuthStore.getState().logout();
          return null;
        })
        .finally(() => {
          proactiveRefreshPromise = null;
        });
    }
    const newToken = await proactiveRefreshPromise;
    if (newToken) {
      config.headers.Authorization = `Bearer ${newToken}`;
    }
  }

  return config;
});

// Response interceptor: handle residual 401s + token refresh fallback
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// BUG-003 FIX: Guard window access so this module is safe to import in SSR context
const redirectToLogin = () => {
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't try to refresh if this was already a refresh request
    if (originalRequest.url?.includes('/auth/refresh')) {
      useAuthStore.getState().logout();
      redirectToLogin();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
        { refreshToken },
      );

      const newAccessToken = data.accessToken;
      const newRefreshToken = data.refreshToken;

      useAuthStore.getState().updateTokens(newAccessToken, newRefreshToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      processQueue(null, newAccessToken);

      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      useAuthStore.getState().logout();
      redirectToLogin();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default apiClient;
