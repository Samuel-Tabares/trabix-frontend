'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ventasMayorApi } from '@/lib/api/ventas-mayor.api';
import type { QueryVentasMayorParams, RegistrarVentaMayorRequest } from '@/types/venta-mayor.types';

export function useVentasMayor(params?: QueryVentasMayorParams) {
  return useQuery({
    queryKey: ['ventas-mayor', params],
    queryFn: () => ventasMayorApi.listar(params),
  });
}

export function useVentaMayor(id: string) {
  return useQuery({
    queryKey: ['ventas-mayor', id],
    queryFn: () => ventasMayorApi.obtener(id),
    enabled: !!id,
  });
}

export function useStockDisponible(vendedorId: string) {
  return useQuery({
    queryKey: ['ventas-mayor', 'stock-disponible', vendedorId],
    queryFn: () => ventasMayorApi.calcularStock(vendedorId),
    enabled: !!vendedorId,
  });
}

export function useRegistrarVentaMayor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RegistrarVentaMayorRequest) => ventasMayorApi.registrar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas-mayor'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stock'] });
    },
  });
}

export function useConfirmarVentaMayor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ventasMayorApi.confirmar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas-mayor'] });
      queryClient.invalidateQueries({ queryKey: ['cuadres-mayor'] });
    },
  });
}

export function useEliminarVentaMayor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ventasMayorApi.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventas-mayor'] });
    },
  });
}
