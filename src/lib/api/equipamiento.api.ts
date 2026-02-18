import apiClient from './client';
import type {
  Equipamiento,
  SolicitarEquipamientoRequest,
  EquipamientosPaginados,
  ReportarDanoRequest,
  PagarDeudaRequest,
  QueryEquipamientosParams,
} from '@/types/equipamiento.types';

export const equipamientoApi = {
  miEquipamiento: async (): Promise<Equipamiento> => {
    const response = await apiClient.get<Equipamiento>('/equipamiento/me');
    return response.data;
  },

  solicitar: async (data: SolicitarEquipamientoRequest): Promise<Equipamiento> => {
    const response = await apiClient.post<Equipamiento>('/equipamiento/solicitar', data);
    return response.data;
  },

  listar: async (params?: QueryEquipamientosParams): Promise<EquipamientosPaginados> => {
    const response = await apiClient.get<EquipamientosPaginados>('/equipamiento', { params });
    return response.data;
  },

  obtener: async (id: string): Promise<Equipamiento> => {
    const response = await apiClient.get<Equipamiento>(`/equipamiento/${id}`);
    return response.data;
  },

  activar: async (id: string): Promise<Equipamiento> => {
    const response = await apiClient.post<Equipamiento>(`/equipamiento/${id}/activar`);
    return response.data;
  },

  reportarDano: async (id: string, data: ReportarDanoRequest): Promise<Equipamiento> => {
    const response = await apiClient.post<Equipamiento>(`/equipamiento/${id}/reportar-dano`, data);
    return response.data;
  },

  reportarPerdida: async (id: string): Promise<Equipamiento> => {
    const response = await apiClient.post<Equipamiento>(`/equipamiento/${id}/reportar-perdida`);
    return response.data;
  },

  devolver: async (id: string): Promise<Equipamiento> => {
    const response = await apiClient.post<Equipamiento>(`/equipamiento/${id}/devolver`);
    return response.data;
  },

  pagarMensualidad: async (id: string): Promise<Equipamiento> => {
    const response = await apiClient.post<Equipamiento>(`/equipamiento/${id}/pagar-mensualidad`);
    return response.data;
  },

  pagarDeuda: async (id: string, data: PagarDeudaRequest): Promise<Equipamiento> => {
    const response = await apiClient.post<Equipamiento>(`/equipamiento/${id}/pagar-deuda`, data);
    return response.data;
  },

  devolverDeposito: async (id: string): Promise<Equipamiento> => {
    const response = await apiClient.post<Equipamiento>(`/equipamiento/${id}/devolver-deposito`);
    return response.data;
  },
};
