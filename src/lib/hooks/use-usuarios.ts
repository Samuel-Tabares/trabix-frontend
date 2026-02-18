'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usuariosApi } from '@/lib/api/usuarios.api';
import type {
  QueryUsuariosParams,
  CreateUsuarioRequest,
  UpdateUsuarioRequest,
  CambiarEstadoRequest,
} from '@/types/usuario.types';

export function useUsuarios(params?: QueryUsuariosParams) {
  return useQuery({
    queryKey: ['usuarios', params],
    queryFn: () => usuariosApi.listar(params),
  });
}

export function useUsuario(id: string) {
  return useQuery({
    queryKey: ['usuarios', id],
    queryFn: () => usuariosApi.obtener(id),
    enabled: !!id,
  });
}

export function useCrearUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUsuarioRequest) => usuariosApi.crear(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });
}

export function useActualizarUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUsuarioRequest }) =>
      usuariosApi.actualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });
}

export function useCambiarEstadoUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CambiarEstadoRequest }) =>
      usuariosApi.cambiarEstado(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (id: string) => usuariosApi.resetPassword(id),
  });
}

export function useDesbloquearUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usuariosApi.desbloquear(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });
}

export function useEliminarUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usuariosApi.eliminar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });
}

export function useRestaurarUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usuariosApi.restaurar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });
}

export function useUsuariosEliminados() {
  return useQuery({
    queryKey: ['usuarios', 'eliminados'],
    queryFn: () => usuariosApi.listarEliminados(),
  });
}

export function useJerarquiaUsuario(id: string) {
  return useQuery({
    queryKey: ['usuarios', id, 'jerarquia'],
    queryFn: () => usuariosApi.obtenerJerarquia(id),
    enabled: !!id,
  });
}
