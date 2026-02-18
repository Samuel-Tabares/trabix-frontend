import apiClient from './client';
import type {
  SaldoFondo,
  TransaccionesPaginadas,
  QueryTransaccionesParams,
  MovimientoFondo,
  RegistrarSalidaRequest,
} from '@/types/fondo.types';

export const fondoRecompensasApi = {
  saldo: async (): Promise<SaldoFondo> => {
    const response = await apiClient.get<SaldoFondo>('/fondo-recompensas/saldo');
    return response.data;
  },

  transacciones: async (params?: QueryTransaccionesParams): Promise<TransaccionesPaginadas> => {
    const response = await apiClient.get<TransaccionesPaginadas>(
      '/fondo-recompensas/transacciones',
      { params },
    );
    return response.data;
  },

  registrarSalida: async (data: RegistrarSalidaRequest): Promise<MovimientoFondo> => {
    const response = await apiClient.post<MovimientoFondo>('/fondo-recompensas/salida', data);
    return response.data;
  },
};
