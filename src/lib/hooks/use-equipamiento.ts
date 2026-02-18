'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { equipamientoApi } from '@/lib/api/equipamiento.api';
import type {
  SolicitarEquipamientoRequest,
  QueryEquipamientosParams,
  ReportarDanoRequest,
  PagarDeudaRequest,
} from '@/types/equipamiento.types';

export function useMiEquipamiento() {
  return useQuery({
    queryKey: ['equipamiento', 'me'],
    queryFn: () => equipamientoApi.miEquipamiento(),
  });
}

export function useSolicitarEquipamiento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SolicitarEquipamientoRequest) => equipamientoApi.solicitar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipamiento'] });
    },
  });
}

export function useEquipamientos(params?: QueryEquipamientosParams) {
  return useQuery({
    queryKey: ['equipamiento', params],
    queryFn: () => equipamientoApi.listar(params),
  });
}

export function useEquipamiento(id: string) {
  return useQuery({
    queryKey: ['equipamiento', id],
    queryFn: () => equipamientoApi.obtener(id),
    enabled: !!id,
  });
}

export function useActivarEquipamiento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => equipamientoApi.activar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipamiento'] });
    },
  });
}

export function useReportarDano() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReportarDanoRequest }) =>
      equipamientoApi.reportarDano(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipamiento'] });
    },
  });
}

export function useReportarPerdida() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => equipamientoApi.reportarPerdida(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipamiento'] });
    },
  });
}

export function useDevolverEquipamiento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => equipamientoApi.devolver(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipamiento'] });
    },
  });
}

export function usePagarMensualidad() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => equipamientoApi.pagarMensualidad(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipamiento'] });
    },
  });
}

export function usePagarDeuda() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PagarDeudaRequest }) =>
      equipamientoApi.pagarDeuda(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipamiento'] });
    },
  });
}

export function useDevolverDeposito() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => equipamientoApi.devolverDeposito(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipamiento'] });
    },
  });
}
