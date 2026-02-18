'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tandasApi } from '@/lib/api/tandas.api';

export function useTandasPorLote(loteId: string) {
  return useQuery({
    queryKey: ['tandas', 'lote', loteId],
    queryFn: () => tandasApi.listarPorLote(loteId),
    enabled: !!loteId,
  });
}

export function useTanda(id: string) {
  return useQuery({
    queryKey: ['tandas', id],
    queryFn: () => tandasApi.obtener(id),
    enabled: !!id,
  });
}

export function useConfirmarEntregaTanda() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tandasApi.confirmarEntrega(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tandas'] });
      queryClient.invalidateQueries({ queryKey: ['lotes'] });
    },
  });
}
