'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { miniCuadresApi } from '@/lib/api/mini-cuadres.api';

export function useMiniCuadrePorLote(loteId: string) {
  return useQuery({
    queryKey: ['mini-cuadres', 'lote', loteId],
    queryFn: () => miniCuadresApi.obtenerPorLote(loteId),
    enabled: !!loteId,
  });
}

export function useMiniCuadre(id: string) {
  return useQuery({
    queryKey: ['mini-cuadres', id],
    queryFn: () => miniCuadresApi.obtener(id),
    enabled: !!id,
  });
}

export function useConfirmarMiniCuadre() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => miniCuadresApi.confirmar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mini-cuadres'] });
    },
  });
}
