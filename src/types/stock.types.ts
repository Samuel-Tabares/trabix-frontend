import { EstadoPedidoStock } from './enums';

export interface StockAdmin {
  id: string;
  stockFisico: number;
  ultimaActualizacion: string;
}

export interface StockDeficit {
  deficit: number;
  stockFisico: number;
  stockReservado: number;
}

export interface PedidoStock {
  id: string;
  cantidadTrabix: number;
  estado: EstadoPedidoStock;
  costoTotal: number;
  costoRealPorTrabix: number;
  fechaCreacion: string;
  fechaRecepcion: string | null;
  notas: string | null;
}

export interface DetalleCostoPedido {
  id: string;
  pedidoId: string;
  concepto: string;
  esObligatorio: boolean;
  cantidad: number | null;
  costoTotal: number;
}

export interface StockAdminResponse {
  stockFisico: number;
  ultimoPedidoId?: string;
  ultimaActualizacion: string;
}

export interface DeficitResponse {
  stockFisico: number;
  stockReservado: number;
  deficit: number;
  hayDeficit: boolean;
}

export interface StockReservadoDetallado {
  totalReservado: number;
  porEstado: Record<string, number>;
  porVendedor: { vendedorId: string; nombre: string; cantidad: number }[];
  porLote: { loteId: string; cantidad: number }[];
}

export interface PedidoStockResponse {
  id: string;
  cantidadTrabix: number;
  estado: EstadoPedidoStock;
  costoTotal: number;
  costoRealPorTrabix: number;
  detallesCosto: DetalleCostoResponse[];
  fechaCreacion: string;
  fechaRecepcion?: string;
  fechaCancelacion?: string;
  motivoCancelacion?: string;
  notas?: string;
}

export interface DetalleCostoResponse {
  id: string;
  concepto: string;
  esObligatorio: boolean;
  cantidad?: number;
  costoTotal: number;
  fechaRegistro: string;
}

export interface PedidosStockPaginados {
  data: PedidoStockResponse[];
  total: number;
  hasMore: boolean;
}

export interface QueryPedidosParams {
  estado?: EstadoPedidoStock;
  skip?: number;
  take?: number;
}

export interface CrearPedidoRequest {
  cantidadTrabix: number;
  notas?: string;
}

export interface ModificarPedidoRequest {
  cantidadTrabix?: number;
  notas?: string;
}

export interface AgregarCostoRequest {
  concepto: string;
  esObligatorio?: boolean;
  cantidad?: number;
  costoTotal: number;
}

export interface CancelarPedidoRequest {
  motivo: string;
}
