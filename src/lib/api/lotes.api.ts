import apiClient from './client';
import type {
  Lote,
  LotesPaginados,
  SolicitarLoteRequest,
  InfoSolicitudLote,
  ResumenFinanciero,
  QueryLotesParams,
} from '@/types/lote.types';
import type { MessageResponse } from '@/types/api.types';

export const lotesApi = {
  listar: async (params?: QueryLotesParams): Promise<LotesPaginados> => {
    const response = await apiClient.get<LotesPaginados>('/lotes', { params });
    return response.data;
  },

  misLotes: async (params?: QueryLotesParams): Promise<LotesPaginados> => {
    const response = await apiClient.get<LotesPaginados>('/lotes/mis-lotes', { params });
    return response.data;
  },

  obtener: async (id: string): Promise<Lote> => {
    const response = await apiClient.get<Lote>(`/lotes/${id}`);
    return response.data;
  },

  solicitar: async (data: SolicitarLoteRequest): Promise<Lote> => {
    const response = await apiClient.post<Lote>('/lotes/solicitar', data);
    return response.data;
  },

  infoSolicitud: async (): Promise<InfoSolicitudLote> => {
    const response = await apiClient.get<InfoSolicitudLote>('/lotes/info-solicitud');
    return response.data;
  },

  resumenFinanciero: async (id: string): Promise<ResumenFinanciero> => {
    const response = await apiClient.get<ResumenFinanciero>(`/lotes/${id}/resumen-financiero`);
    return response.data;
  },

  activar: async (id: string): Promise<Lote> => {
    const response = await apiClient.post<Lote>(`/lotes/${id}/activar`);
    return response.data;
  },

  cancelar: async (id: string): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>(`/lotes/${id}/cancelar`);
    return response.data;
  },

  crearLote: async (data: { vendedorId: string; cantidadTrabix: number }): Promise<Lote> => {
    const response = await apiClient.post<Lote>('/lotes', data);
    return response.data;
  },
};
