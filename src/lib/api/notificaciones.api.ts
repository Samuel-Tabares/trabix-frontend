import apiClient from './client';
import type {
  NotificacionesPaginadas,
  ContadorNotificaciones,
  QueryNotificacionesParams,
  Notificacion,
  EnviarNotificacionRequest,
} from '@/types/notificacion.types';

export const notificacionesApi = {
  listar: async (params?: QueryNotificacionesParams): Promise<NotificacionesPaginadas> => {
    const response = await apiClient.get<NotificacionesPaginadas>('/notificaciones', { params });
    return response.data;
  },

  contador: async (): Promise<ContadorNotificaciones> => {
    const response = await apiClient.get<ContadorNotificaciones>('/notificaciones/contador');
    return response.data;
  },

  marcarLeida: async (id: string): Promise<Notificacion> => {
    const response = await apiClient.patch<Notificacion>(`/notificaciones/${id}/leer`);
    return response.data;
  },

  marcarTodasLeidas: async (): Promise<{ marcadas: number }> => {
    const response = await apiClient.patch<{ marcadas: number }>('/notificaciones/leer-todas');
    return response.data;
  },

  enviar: async (data: EnviarNotificacionRequest): Promise<Notificacion> => {
    const response = await apiClient.post<Notificacion>('/notificaciones', data);
    return response.data;
  },
};
