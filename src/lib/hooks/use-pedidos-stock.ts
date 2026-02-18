'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pedidosStockApi } from '@/lib/api/pedidos-stock.api';
import type {
  QueryPedidosParams,
  CrearPedidoRequest,
  ModificarPedidoRequest,
  AgregarCostoRequest,
  CancelarPedidoRequest,
} from '@/types/stock.types';

export function usePedidosStock(params?: QueryPedidosParams) {
  return useQuery({
    queryKey: ['pedidos-stock', params],
    queryFn: () => pedidosStockApi.listar(params),
  });
}

export function usePedidoStock(id: string) {
  return useQuery({
    queryKey: ['pedidos-stock', id],
    queryFn: () => pedidosStockApi.obtener(id),
    enabled: !!id,
  });
}

export function useCrearPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CrearPedidoRequest) => pedidosStockApi.crear(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos-stock'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stock'] });
    },
  });
}

export function useModificarPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ModificarPedidoRequest }) =>
      pedidosStockApi.modificar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos-stock'] });
    },
  });
}

export function useAgregarCosto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pedidoId, data }: { pedidoId: string; data: AgregarCostoRequest }) =>
      pedidosStockApi.agregarCosto(pedidoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos-stock'] });
    },
  });
}

export function useEliminarCosto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pedidoId, costoId }: { pedidoId: string; costoId: string }) =>
      pedidosStockApi.eliminarCosto(pedidoId, costoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos-stock'] });
    },
  });
}

export function useConfirmarPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pedidosStockApi.confirmar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos-stock'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stock'] });
    },
  });
}

export function useRecibirPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pedidosStockApi.recibir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos-stock'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stock'] });
    },
  });
}

export function useCancelarPedido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CancelarPedidoRequest }) =>
      pedidosStockApi.cancelar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos-stock'] });
    },
  });
}
