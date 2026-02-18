import apiClient from './client';
import type {
  CuadreMayor,
  CuadresMayorPaginados,
  QueryCuadresMayorParams,
} from '@/types/cuadre-mayor.types';

export const cuadresMayorApi = {
  listar: async (params?: QueryCuadresMayorParams): Promise<CuadresMayorPaginados> => {
    const response = await apiClient.get<CuadresMayorPaginados>('/cuadres-mayor', { params });
    return response.data;
  },

  obtener: async (id: string): Promise<CuadreMayor> => {
    const response = await apiClient.get<CuadreMayor>(`/cuadres-mayor/${id}`);
    return response.data;
  },

  confirmar: async (id: string): Promise<CuadreMayor> => {
    const response = await apiClient.post<CuadreMayor>(`/cuadres-mayor/${id}/confirmar`);
    return response.data;
  },
};
