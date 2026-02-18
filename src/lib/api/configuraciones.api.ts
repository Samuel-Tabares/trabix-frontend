import apiClient from './client';
import type {
  ConfiguracionSistema,
  ModificarConfiguracionRequest,
  HistorialConfiguracionPaginado,
  HistorialConfiguracion,
  TipoInsumo,
  CrearTipoInsumoRequest,
  ModificarTipoInsumoRequest,
} from '@/types/configuracion.types';
import type { MessageResponse } from '@/types/api.types';

export const configuracionesApi = {
  listar: async (): Promise<ConfiguracionSistema[]> => {
    const response = await apiClient.get<ConfiguracionSistema[]>('/admin/configuraciones');
    return response.data;
  },

  listarPorCategoria: async (categoria: string): Promise<ConfiguracionSistema[]> => {
    const response = await apiClient.get<ConfiguracionSistema[]>(
      `/admin/configuraciones/categoria/${categoria}`,
    );
    return response.data;
  },

  obtener: async (clave: string): Promise<ConfiguracionSistema> => {
    const response = await apiClient.get<ConfiguracionSistema>(`/admin/configuraciones/${clave}`);
    return response.data;
  },

  modificar: async (
    clave: string,
    data: ModificarConfiguracionRequest,
  ): Promise<ConfiguracionSistema> => {
    const response = await apiClient.patch<ConfiguracionSistema>(`/admin/configuraciones/${clave}`, data);
    return response.data;
  },

  historial: async (params?: {
    skip?: number;
    take?: number;
  }): Promise<HistorialConfiguracionPaginado> => {
    const response = await apiClient.get<HistorialConfiguracionPaginado>(
      '/admin/configuraciones/historial',
      { params },
    );
    return response.data;
  },

  historialPorClave: async (clave: string): Promise<HistorialConfiguracion[]> => {
    const response = await apiClient.get<HistorialConfiguracion[]>(
      `/admin/configuraciones/historial/${clave}`,
    );
    return response.data;
  },

  listarTiposInsumo: async (): Promise<TipoInsumo[]> => {
    const response = await apiClient.get<TipoInsumo[]>('/admin/tipos-insumo');
    return response.data;
  },

  crearTipoInsumo: async (data: CrearTipoInsumoRequest): Promise<TipoInsumo> => {
    const response = await apiClient.post<TipoInsumo>('/admin/tipos-insumo', data);
    return response.data;
  },

  modificarTipoInsumo: async (
    id: string,
    data: ModificarTipoInsumoRequest,
  ): Promise<TipoInsumo> => {
    const response = await apiClient.patch<TipoInsumo>(`/admin/tipos-insumo/${id}`, data);
    return response.data;
  },

  eliminarTipoInsumo: async (id: string): Promise<MessageResponse> => {
    const response = await apiClient.delete<MessageResponse>(`/admin/tipos-insumo/${id}`);
    return response.data;
  },
};
