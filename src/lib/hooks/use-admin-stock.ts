'use client';

import { useQuery } from '@tanstack/react-query';
import { adminStockApi } from '@/lib/api/admin-stock.api';

export function useStockAdmin() {
  return useQuery({
    queryKey: ['admin-stock'],
    queryFn: () => adminStockApi.obtenerStock(),
  });
}

export function useDeficit() {
  return useQuery({
    queryKey: ['admin-stock', 'deficit'],
    queryFn: () => adminStockApi.obtenerDeficit(),
  });
}

export function useStockReservado() {
  return useQuery({
    queryKey: ['admin-stock', 'reservado'],
    queryFn: () => adminStockApi.obtenerStockReservado(),
  });
}
