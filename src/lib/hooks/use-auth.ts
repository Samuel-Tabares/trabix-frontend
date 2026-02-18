'use client';

import { useQuery } from '@tanstack/react-query';
import { usuariosApi } from '@/lib/api/usuarios.api';
import { useAuthStore } from '@/lib/store/auth.store';

export function useCurrentUser() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ['usuarios', 'me'],
    queryFn: () => usuariosApi.me(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}
