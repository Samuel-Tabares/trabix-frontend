import apiClient from './client';
import type {
  AuthResponse,
  LoginRequest,
  ChangePasswordRequest,
  ResetPasswordResponse,
} from '@/types/auth.types';
import type { MessageResponse } from '@/types/api.types';

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },

  logout: async (refreshToken: string): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>('/auth/logout', {
      refreshToken,
    });
    return response.data;
  },

  cambiarPassword: async (
    data: ChangePasswordRequest,
  ): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>(
      '/auth/cambiar-password',
      data,
    );
    return response.data;
  },

  resetPassword: async (userId: string): Promise<ResetPasswordResponse> => {
    const response = await apiClient.post<ResetPasswordResponse>(
      `/auth/admin/reset-password/${userId}`,
    );
    return response.data;
  },

  desbloquear: async (userId: string): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>(
      `/auth/admin/desbloquear/${userId}`,
    );
    return response.data;
  },
};
