import apiClient from './client';
import type { Tanda } from '@/types/tanda.types';

export const tandasApi = {
  listarPorLote: async (loteId: string): Promise<Tanda[]> => {
    const response = await apiClient.get<Tanda[]>(`/tandas/lote/${loteId}`);
    return response.data;
  },

  obtener: async (id: string): Promise<Tanda> => {
    const response = await apiClient.get<Tanda>(`/tandas/${id}`);
    return response.data;
  },

  confirmarEntrega: async (id: string): Promise<Tanda> => {
    const response = await apiClient.post<Tanda>(`/tandas/${id}/confirmar-entrega`);
    return response.data;
  },
};
