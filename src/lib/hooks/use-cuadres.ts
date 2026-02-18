'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cuadresApi } from '@/lib/api/cuadres.api';
import type { QueryCuadresParams } from '@/types/cuadre.types';

export function useCuadres(params?: QueryCuadresParams) {
  return useQuery({
    queryKey: ['cuadres', params],
    queryFn: () => cuadresApi.listar(params),
  });
}

export function useCuadre(id: string) {
  return useQuery({
    queryKey: ['cuadres', id],
    queryFn: () => cuadresApi.obtener(id),
    enabled: !!id,
  });
}

export function useConfirmarCuadre() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, montoRecibido }: { id: string; montoRecibido: number }) =>
      cuadresApi.confirmar(id, montoRecibido),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cuadres'] });
    },
  });
}
