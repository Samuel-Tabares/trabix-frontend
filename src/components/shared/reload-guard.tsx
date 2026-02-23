'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/store/auth.store';

const STORAGE_KEY = 'trabix-reload-ts';
const WINDOW_MS = 10_000; // 10 segundos
const WARN_THRESHOLD = 3;  // advertir en la 3ª recarga rápida
const LOGOUT_THRESHOLD = 4; // cerrar sesión en la 4ª (antes del 429 al 5º)

const clearAuthCookie = () => {
  if (typeof window !== 'undefined') {
    document.cookie = 'trabix-auth=;path=/;max-age=0';
  }
};

/**
 * Corre sincrónicamente en el inicializador de useState (antes de que los hijos
 * monten), de forma que si se alcanza el límite se limpia Zustand antes de que
 * los hooks de data-fetching de la página disparen sus requests.
 */
function evaluateReloadCount(): 'ok' | 'warn' | 'logout' {
  if (typeof window === 'undefined') return 'ok';

  const { isAuthenticated } = useAuthStore.getState();
  if (!isAuthenticated) return 'ok';

  const now = Date.now();
  let timestamps: number[] = [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) timestamps = JSON.parse(raw) as number[];
  } catch {
    timestamps = [];
  }

  timestamps = timestamps.filter((t) => now - t < WINDOW_MS);
  timestamps.push(now);
  const count = timestamps.length;

  if (count >= LOGOUT_THRESHOLD) {
    sessionStorage.removeItem(STORAGE_KEY);
    // Limpiar auth síncronamente: los hijos verán isAuthenticated=false
    // y el interceptor no intentará el proactive refresh → sin 429.
    clearAuthCookie();
    useAuthStore.getState().logout();
    return 'logout';
  }

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(timestamps));
  return count === WARN_THRESHOLD ? 'warn' : 'ok';
}

export function ReloadGuard() {
  // useState con lazy initializer: corre una sola vez en el primer render,
  // antes de que los componentes hijo monten y lancen sus queries.
  const [action] = useState<'ok' | 'warn' | 'logout'>(evaluateReloadCount);

  useEffect(() => {
    if (action === 'logout') {
      window.location.href = '/login';
    } else if (action === 'warn') {
      toast.warning(
        'Estás recargando muy rápido. Si continúas, tu sesión se cerrará por seguridad.',
        { id: 'reload-warning', duration: 8000 },
      );
    }
  }, [action]);

  return null;
}
