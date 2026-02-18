import apiClient from './client';
import type {
  VentaMayor,
  VentasMayorPaginadas,
  QueryVentasMayorParams,
  RegistrarVentaMayorRequest,
  StockDisponibleResponse,
} from '@/types/venta-mayor.types';

export const ventasMayorApi = {
  registrar: async (data: RegistrarVentaMayorRequest): Promise<VentaMayor> => {
    const response = await apiClient.post<VentaMayor>('/ventas-mayor', data);
    return response.data;
  },

  listar: async (params?: QueryVentasMayorParams): Promise<VentasMayorPaginadas> => {
    const response = await apiClient.get<VentasMayorPaginadas>('/ventas-mayor', { params });
    return response.data;
  },

  obtener: async (id: string): Promise<VentaMayor> => {
    const response = await apiClient.get<VentaMayor>(`/ventas-mayor/${id}`);
    return response.data;
  },

  calcularStock: async (): Promise<StockDisponibleResponse> => {
    const response = await apiClient.get<StockDisponibleResponse>('/ventas-mayor/calcular-stock');
    return response.data;
  },

  completar: async (id: string): Promise<VentaMayor> => {
    const response = await apiClient.post<VentaMayor>(`/ventas-mayor/${id}/completar`);
    return response.data;
  },
};
