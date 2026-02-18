import apiClient from './client';
import type {
  Usuario,
  UsuarioJerarquia,
  UsuariosPaginados,
  CreateUsuarioRequest,
  CreateUsuarioResponse,
  UpdateUsuarioRequest,
  CambiarEstadoRequest,
  QueryUsuariosParams,
} from '@/types/usuario.types';
import type { MessageResponse } from '@/types/api.types';

export const usuariosApi = {
  me: async (): Promise<Usuario> => {
    const response = await apiClient.get<Usuario>('/usuarios/me');
    return response.data;
  },

  meJerarquia: async (): Promise<UsuarioJerarquia> => {
    const response = await apiClient.get<UsuarioJerarquia>('/usuarios/me/jerarquia');
    return response.data;
  },

  obtener: async (id: string): Promise<Usuario> => {
    const response = await apiClient.get<Usuario>(`/usuarios/${id}`);
    return response.data;
  },

  crear: async (data: CreateUsuarioRequest): Promise<CreateUsuarioResponse> => {
    const response = await apiClient.post<CreateUsuarioResponse>('/usuarios', data);
    return response.data;
  },

  listar: async (params?: QueryUsuariosParams): Promise<UsuariosPaginados> => {
    const response = await apiClient.get<UsuariosPaginados>('/usuarios', { params });
    return response.data;
  },

  actualizar: async (id: string, data: UpdateUsuarioRequest): Promise<Usuario> => {
    const response = await apiClient.patch<Usuario>(`/usuarios/${id}`, data);
    return response.data;
  },

  cambiarEstado: async (id: string, data: CambiarEstadoRequest): Promise<Usuario> => {
    const response = await apiClient.patch<Usuario>(`/usuarios/${id}/estado`, data);
    return response.data;
  },

  resetPassword: async (id: string): Promise<{ passwordTemporal: string; message: string }> => {
    const response = await apiClient.post<{ passwordTemporal: string; message: string }>(
      `/usuarios/${id}/reset-password`,
    );
    return response.data;
  },

  desbloquear: async (id: string): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>(`/usuarios/${id}/desbloquear`);
    return response.data;
  },

  eliminar: async (id: string): Promise<MessageResponse> => {
    const response = await apiClient.delete<MessageResponse>(`/usuarios/${id}`);
    return response.data;
  },

  restaurar: async (id: string): Promise<Usuario> => {
    const response = await apiClient.post<Usuario>(`/usuarios/${id}/restaurar`);
    return response.data;
  },

  listarEliminados: async (): Promise<Usuario[]> => {
    const response = await apiClient.get<Usuario[]>('/usuarios/eliminados');
    return response.data;
  },

  obtenerJerarquia: async (id: string): Promise<UsuarioJerarquia> => {
    const response = await apiClient.get<UsuarioJerarquia>(`/usuarios/${id}/jerarquia`);
    return response.data;
  },
};
