import apiClient from './client';
import type {
  Venta,
  VentasPaginadas,
  CreateVentaRequest,
  QueryVentasParams,
} from '@/types/venta.types';

export const ventasApi = {
  crear: async (data: CreateVentaRequest): Promise<Venta> => {
    const response = await apiClient.post<Venta>('/ventas', data);
    return response.data;
  },

  listar: async (params?: QueryVentasParams): Promise<VentasPaginadas> => {
    const response = await apiClient.get<VentasPaginadas>('/ventas', { params });
    return response.data;
  },

  obtener: async (id: string): Promise<Venta> => {
    const response = await apiClient.get<Venta>(`/ventas/${id}`);
    return response.data;
  },
};
