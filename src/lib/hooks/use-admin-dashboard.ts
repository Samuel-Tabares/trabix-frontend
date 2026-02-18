'use client';

import { useQuery } from '@tanstack/react-query';
import { adminDashboardApi } from '@/lib/api/admin-dashboard.api';

export function useResumenDashboard() {
  return useQuery({
    queryKey: ['admin-dashboard', 'resumen'],
    queryFn: () => adminDashboardApi.resumen(),
  });
}

export function useVentasPeriodo(periodo: string) {
  return useQuery({
    queryKey: ['admin-dashboard', 'ventas-periodo', periodo],
    queryFn: () => adminDashboardApi.ventasPeriodo(periodo),
    enabled: !!periodo,
  });
}

export function useVendedoresActivos() {
  return useQuery({
    queryKey: ['admin-dashboard', 'vendedores-activos'],
    queryFn: () => adminDashboardApi.vendedoresActivos(),
  });
}

export function useCuadresPendientes() {
  return useQuery({
    queryKey: ['admin-dashboard', 'cuadres-pendientes'],
    queryFn: () => adminDashboardApi.cuadresPendientes(),
  });
}
