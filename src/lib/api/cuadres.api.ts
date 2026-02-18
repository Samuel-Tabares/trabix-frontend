import apiClient from './client';
import type { Cuadre, CuadresPaginados, QueryCuadresParams } from '@/types/cuadre.types';

export const cuadresApi = {
  listar: async (params?: QueryCuadresParams): Promise<CuadresPaginados> => {
    const response = await apiClient.get<CuadresPaginados>('/cuadres', { params });
    return response.data;
  },

  obtener: async (id: string): Promise<Cuadre> => {
    const response = await apiClient.get<Cuadre>(`/cuadres/${id}`);
    return response.data;
  },

  confirmar: async (id: string, montoRecibido: number): Promise<Cuadre> => {
    const response = await apiClient.post<Cuadre>(`/cuadres/${id}/confirmar`, { montoRecibido });
    return response.data;
  },
};
