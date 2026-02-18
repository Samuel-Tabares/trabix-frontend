import apiClient from './client';
import type {
  PedidoStockResponse,
  PedidosStockPaginados,
  QueryPedidosParams,
  CrearPedidoRequest,
  ModificarPedidoRequest,
  AgregarCostoRequest,
  CancelarPedidoRequest,
} from '@/types/stock.types';

export const pedidosStockApi = {
  crear: async (data: CrearPedidoRequest): Promise<PedidoStockResponse> => {
    const response = await apiClient.post<PedidoStockResponse>('adminadmin/pedidos-stock', data);
    return response.data;
  },

  listar: async (params?: QueryPedidosParams): Promise<PedidosStockPaginados> => {
    const response = await apiClient.get<PedidosStockPaginados>('admin/pedidos-stock', { params });
    return response.data;
  },

  obtener: async (id: string): Promise<PedidoStockResponse> => {
    const response = await apiClient.get<PedidoStockResponse>(`admin/pedidos-stock/${id}`);
    return response.data;
  },

  modificar: async (id: string, data: ModificarPedidoRequest): Promise<PedidoStockResponse> => {
    const response = await apiClient.patch<PedidoStockResponse>(`admin/pedidos-stock/${id}`, data);
    return response.data;
  },

  agregarCosto: async (id: string, data: AgregarCostoRequest): Promise<PedidoStockResponse> => {
    const response = await apiClient.post<PedidoStockResponse>(
      `admin/pedidos-stock/${id}/costos`,
      data,
    );
    return response.data;
  },

  eliminarCosto: async (pedidoId: string, costoId: string): Promise<PedidoStockResponse> => {
    const response = await apiClient.delete<PedidoStockResponse>(
      `admin/pedidos-stock/${pedidoId}/costos/${costoId}`,
    );
    return response.data;
  },

  confirmar: async (id: string): Promise<PedidoStockResponse> => {
    const response = await apiClient.post<PedidoStockResponse>(`admin/pedidos-stock/${id}/confirmar`);
    return response.data;
  },

  recibir: async (id: string): Promise<PedidoStockResponse> => {
    const response = await apiClient.post<PedidoStockResponse>(`admin/pedidos-stock/${id}/recibir`);
    return response.data;
  },

  cancelar: async (id: string, data: CancelarPedidoRequest): Promise<PedidoStockResponse> => {
    const response = await apiClient.post<PedidoStockResponse>(
      `admin/pedidos-stock/${id}/cancelar`,
      data,
    );
    return response.data;
  },
};
