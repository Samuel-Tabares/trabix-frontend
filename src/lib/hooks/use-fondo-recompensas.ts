'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fondoRecompensasApi } from '@/lib/api/fondo-recompensas.api';
import type { QueryTransaccionesParams, RegistrarSalidaRequest } from '@/types/fondo.types';

export function useSaldoFondo() {
  return useQuery({
    queryKey: ['fondo-recompensas', 'saldo'],
    queryFn: () => fondoRecompensasApi.saldo(),
  });
}

export function useTransaccionesFondo(params?: QueryTransaccionesParams) {
  return useQuery({
    queryKey: ['fondo-recompensas', 'transacciones', params],
    queryFn: () => fondoRecompensasApi.transacciones(params),
  });
}

export function useRegistrarSalida() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RegistrarSalidaRequest) => fondoRecompensasApi.registrarSalida(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fondo-recompensas'] });
    },
  });
}
