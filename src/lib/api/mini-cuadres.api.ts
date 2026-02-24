import apiClient from './client';
import type { MiniCuadre } from '@/types/mini-cuadre.types';

export const miniCuadresApi = {
  listar: async (): Promise<MiniCuadre[]> => {
    const response = await apiClient.get<MiniCuadre[]>('/mini-cuadres');
    return response.data;
  },

  obtenerPorLote: async (loteId: string): Promise<MiniCuadre> => {
    const response = await apiClient.get<MiniCuadre>(`/mini-cuadres/lote/${loteId}`);
    return response.data;
  },

  obtener: async (id: string): Promise<MiniCuadre> => {
    const response = await apiClient.get<MiniCuadre>(`/mini-cuadres/${id}`);
    return response.data;
  },

  confirmar: async (id: string): Promise<MiniCuadre> => {
    const response = await apiClient.post<MiniCuadre>(`/mini-cuadres/${id}/confirmar`);
    return response.data;
  },
};
