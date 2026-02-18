'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { configuracionesApi } from '@/lib/api/configuraciones.api';
import type { ModificarConfiguracionRequest, CrearTipoInsumoRequest, ModificarTipoInsumoRequest } from '@/types/configuracion.types';

export function useConfiguraciones() {
  return useQuery({
    queryKey: ['configuraciones'],
    queryFn: () => configuracionesApi.listar(),
  });
}

export function useConfiguracionesPorCategoria(categoria: string) {
  return useQuery({
    queryKey: ['configuraciones', 'categoria', categoria],
    queryFn: () => configuracionesApi.listarPorCategoria(categoria),
    enabled: !!categoria,
  });
}

export function useModificarConfiguracion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ModificarConfiguracionRequest }) =>
      configuracionesApi.modificar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuraciones'] });
    },
  });
}

export function useHistorialConfiguracion(params?: { skip?: number; take?: number }) {
  return useQuery({
    queryKey: ['configuraciones', 'historial', params],
    queryFn: () => configuracionesApi.historial(params),
  });
}

export function useTiposInsumo() {
  return useQuery({
    queryKey: ['tipos-insumo'],
    queryFn: () => configuracionesApi.listarTiposInsumo(),
  });
}

export function useCrearTipoInsumo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CrearTipoInsumoRequest) => configuracionesApi.crearTipoInsumo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-insumo'] });
    },
  });
}

export function useModificarTipoInsumo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ModificarTipoInsumoRequest }) =>
      configuracionesApi.modificarTipoInsumo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-insumo'] });
    },
  });
}

export function useEliminarTipoInsumo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => configuracionesApi.eliminarTipoInsumo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-insumo'] });
    },
  });
}
