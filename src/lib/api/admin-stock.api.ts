import apiClient from './client';
import type {
  StockAdminResponse,
  DeficitResponse,
  StockReservadoDetallado,
} from '@/types/stock.types';

export const adminStockApi = {
  obtenerStock: async (): Promise<StockAdminResponse> => {
    const response = await apiClient.get<StockAdminResponse>('/admin/stock');
    return response.data;
  },

  obtenerDeficit: async (): Promise<DeficitResponse> => {
    const response = await apiClient.get<DeficitResponse>('/admin/stock/deficit');
    return response.data;
  },

  obtenerStockReservado: async (): Promise<StockReservadoDetallado> => {
    const response = await apiClient.get<StockReservadoDetallado>('/admin/stock/reservado');
    return response.data;
  },
};
