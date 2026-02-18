'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ventasApi } from '@/lib/api/ventas.api';
import type { QueryVentasParams, CreateVentaRequest } from '@/types/venta.types';

export function useVentas(params?: QueryVentasParams) {
  return useQuery({
    queryKey: ['ventas', params],
    queryFn: () => ventasApi.listar(params),
  });
}

export function useVenta(id: string) {
  return useQuery({
    queryKey: ['ventas', id],
    queryFn: () => ventasApi.obtener(id),
    enabled: !!id,
  });
}

export function useCrearVenta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateVentaRequest) => ventasApi.crear(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
      queryClient.invalidateQueries({ queryKey: ['lotes'] });
    },
  });
}

export function useAprobarVenta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ventasApi.aprobar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
    },
  });
}

export function useRechazarVenta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ventasApi.rechazar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas'] });
    },
  });
}
