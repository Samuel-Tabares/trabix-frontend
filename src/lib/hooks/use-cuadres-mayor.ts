'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cuadresMayorApi } from '@/lib/api/cuadres-mayor.api';
import type { QueryCuadresMayorParams } from '@/types/cuadre-mayor.types';

export function useCuadresMayor(params?: QueryCuadresMayorParams) {
  return useQuery({
    queryKey: ['cuadres-mayor', params],
    queryFn: () => cuadresMayorApi.listar(params),
  });
}

export function useCuadreMayor(id: string) {
  return useQuery({
    queryKey: ['cuadres-mayor', id],
    queryFn: () => cuadresMayorApi.obtener(id),
    enabled: !!id,
  });
}

export function useConfirmarCuadreMayor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cuadresMayorApi.confirmar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cuadres-mayor'] });
    },
  });
}
