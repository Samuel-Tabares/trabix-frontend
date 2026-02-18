import apiClient from './client';
import type {
  ResumenDashboard,
  VentasPeriodo,
  VendedoresActivosDetalle,
  CuadrePendienteResumen,
} from '@/types/dashboard.types';

export const adminDashboardApi = {
  resumen: async (): Promise<ResumenDashboard> => {
    const response = await apiClient.get<ResumenDashboard>('/admin/dashboard/resumen');
    return response.data;
  },

  ventasPeriodo: async (periodo: string): Promise<VentasPeriodo> => {
    const response = await apiClient.get<VentasPeriodo>('/admin/dashboard/ventas-periodo', {
      params: { periodo },
    });
    return response.data;
  },

  vendedoresActivos: async (): Promise<VendedoresActivosDetalle> => {
    const response = await apiClient.get<VendedoresActivosDetalle>(
      '/admin/dashboard/vendedores-activos',
    );
    return response.data;
  },

  cuadresPendientes: async (): Promise<CuadrePendienteResumen[]> => {
    const response = await apiClient.get<CuadrePendienteResumen[]>(
      '/admin/dashboard/cuadres-pendientes',
    );
    return response.data;
  },
};
