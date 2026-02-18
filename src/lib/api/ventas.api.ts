import apiClient from './client';
import type {
  Venta,
  VentasPaginadas,
  CreateVentaRequest,
  QueryVentasParams,
} from '@/types/venta.types';
import type { MessageResponse } from '@/types/api.types';

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

  aprobar: async (id: string): Promise<Venta> => {
    const response = await apiClient.post<Venta>(`/ventas/${id}/aprobar`);
    return response.data;
  },

  rechazar: async (id: string): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>(`/ventas/${id}/rechazar`);
    return response.data;
  },
};
