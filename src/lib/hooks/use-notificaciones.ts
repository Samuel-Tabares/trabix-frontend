'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificacionesApi } from '@/lib/api/notificaciones.api';
import type { QueryNotificacionesParams, EnviarNotificacionRequest } from '@/types/notificacion.types';

export function useNotificaciones(params?: QueryNotificacionesParams) {
  return useQuery({
    queryKey: ['notificaciones', params],
    queryFn: () => notificacionesApi.listar(params),
  });
}

export function useContadorNotificaciones() {
  return useQuery({
    queryKey: ['notificaciones', 'contador'],
    queryFn: () => notificacionesApi.contador(),
    refetchInterval: 30000,
  });
}

export function useEnviarNotificacion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: EnviarNotificacionRequest) => notificacionesApi.enviar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] });
    },
  });
}
