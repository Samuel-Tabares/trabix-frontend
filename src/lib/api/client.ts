import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/lib/store/auth.store';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: true envía la HttpOnly cookie 'rt' automáticamente en cada request
  // Necesario para que el browser incluya cookies en requests cross-origin (dev: puertos distintos)
  withCredentials: true,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

// BUG-003 FIX: Guard window access so this module is safe to import in SSR context
const redirectToLogin = () => {
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

// ─── Silent token refresh ─────────────────────────────────────────────────────
// Renueva el access token 2 minutos antes de que expire para mantener la sesión
// activa mientras la pestaña está abierta, sin requerir un page reload.

const REFRESH_MARGIN_MS = 2 * 60 * 1000; // Renovar 2 min antes de la expiración
let silentRefreshTimer: ReturnType<typeof setTimeout> | null = null;

const doSilentRefresh = async () => {
  // Evitar renovación si el usuario ya cerró sesión
  if (!useAuthStore.getState().isAuthenticated) return;

  try {
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
      {},
      { withCredentials: true },
    );
    useAuthStore.getState().updateTokens(data.accessToken);
    scheduleTokenRefresh(data.expiresIn as number);
  } catch {
    // La cookie rt expiró o fue invalidada — cerrar sesión limpiamente
    useAuthStore.getState().logout();
    redirectToLogin();
  }
};

/**
 * Programa la próxima renovación silenciosa del token.
 * @param expiresInSeconds Tiempo de vida del token en segundos (viene del backend en expiresIn)
 */
const scheduleTokenRefresh = (expiresInSeconds: number) => {
  if (typeof window === 'undefined') return;
  if (silentRefreshTimer) clearTimeout(silentRefreshTimer);
  const delay = Math.max(0, expiresInSeconds * 1000 - REFRESH_MARGIN_MS);
  silentRefreshTimer = setTimeout(doSilentRefresh, delay);
};

// ─── Request interceptor ──────────────────────────────────────────────────────
// Adjunta el token de auth y hace un refresh proactivo en page reload.

// BUG-001 FIX: Shared proactive-refresh promise so all concurrent requests on
// page reload wait for one refresh cycle instead of each getting a 401 first.
let proactiveRefreshPromise: Promise<string | null> | null = null;

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  // Skip proactive refresh for login/refresh endpoints to avoid recursion
  if (config.url?.includes('/auth/login') || config.url?.includes('/auth/refresh')) {
    return config;
  }

  const { accessToken, isAuthenticated } = useAuthStore.getState();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  }

  // No accessToken (page reload — accessToken no se persiste) pero isAuthenticated=true en store.
  // El refreshToken está en la HttpOnly cookie 'rt' — el browser la envía automáticamente.
  if (isAuthenticated) {
    if (!proactiveRefreshPromise) {
      proactiveRefreshPromise = axios
        .post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {}, { withCredentials: true })
        .then((res) => {
          useAuthStore.getState().updateTokens(res.data.accessToken);
          scheduleTokenRefresh(res.data.expiresIn as number);
          return res.data.accessToken as string;
        })
        .catch(() => {
          // La cookie rt no existe o expiró — cerrar sesión y redirigir de inmediato.
          // No esperar a que los requests pendientes reciban 401 y reintenten.
          useAuthStore.getState().logout();
          redirectToLogin();
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

// ─── Response interceptor ─────────────────────────────────────────────────────
// Maneja 401s residuales y hace refresh fallback cuando el token expira en-vuelo.

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

apiClient.interceptors.response.use(
  (response) => {
    // Después de un login exitoso, programar la primera renovación silenciosa.
    // Esto asegura que el token nunca expire mientras la pestaña está abierta.
    if (response.config.url?.includes('/auth/login') && response.data?.expiresIn) {
      scheduleTokenRefresh(response.data.expiresIn as number);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't try to refresh for auth endpoints — propagate the error as-is
    if (
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/login')
    ) {
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
      // El refreshToken está en la cookie HttpOnly — no hace falta enviarlo en el body
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
        {},
        { withCredentials: true },
      );

      const newAccessToken = data.accessToken;

      useAuthStore.getState().updateTokens(newAccessToken);
      scheduleTokenRefresh(data.expiresIn as number);

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
