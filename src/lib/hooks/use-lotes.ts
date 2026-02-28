'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lotesApi } from '@/lib/api/lotes.api';
import type { SolicitarLoteRequest, QueryLotesParams } from '@/types/lote.types';

export function useMisLotes(params?: QueryLotesParams) {
  return useQuery({
    queryKey: ['mis-lotes', params],
    queryFn: () => lotesApi.misLotes(params),
  });
}

export function useLote(id: string) {
  return useQuery({
    queryKey: ['lotes', id],
    queryFn: () => lotesApi.obtener(id),
    enabled: !!id,
  });
}

export function useResumenFinanciero(loteId: string) {
  return useQuery({
    queryKey: ['lotes', loteId, 'resumen-financiero'],
    queryFn: () => lotesApi.resumenFinanciero(loteId),
    enabled: !!loteId,
  });
}

export function useInfoSolicitud() {
  return useQuery({
    queryKey: ['lotes', 'info-solicitud'],
    queryFn: () => lotesApi.infoSolicitud(),
  });
}

export function useSolicitarLote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SolicitarLoteRequest) => lotesApi.solicitar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mis-lotes'] });
      queryClient.invalidateQueries({ queryKey: ['lotes', 'info-solicitud'] });
    },
  });
}

export function useLotes(params?: QueryLotesParams, enabled = true) {
  return useQuery({
    queryKey: ['lotes', params],
    queryFn: () => lotesApi.listar(params),
    enabled,
  });
}

export function useActivarLote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => lotesApi.activar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lotes'] });
    },
  });
}

export function useCancelarLote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => lotesApi.cancelar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lotes'] });
    },
  });
}

export function useCrearLote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { vendedorId: string; cantidadTrabix: number }) => lotesApi.crearLote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lotes'] });
    },
  });
}
