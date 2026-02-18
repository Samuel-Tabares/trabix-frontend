import { EstadoVenta, TipoVenta } from './enums';

export interface DetalleVentaRequest {
  tipo: TipoVenta;
  cantidad: number;
}

export interface CreateVentaRequest {
  detalles: DetalleVentaRequest[];
}

export interface DetalleVenta {
  id: string;
  ventaId: string;
  tipo: TipoVenta;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  trabixConsumidos: number;
}

export interface Venta {
  id: string;
  vendedorId: string;
  loteId: string;
  tandaId: string;
  estado: EstadoVenta;
  montoTotal: number;
  cantidadTrabix: number;
  detalles: DetalleVenta[];
  cantidadRegalos: number;
  fechaRegistro: string;
  fechaValidacion: string | null;
}

export interface VentasPaginadas {
  data: Venta[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface QueryVentasParams {
  vendedorId?: string;
  loteId?: string;
  tandaId?: string;
  estado?: EstadoVenta;
  skip?: number;
  take?: number;
  cursor?: string;
  orderBy?: 'fechaRegistro' | 'fechaValidacion' | 'montoTotal';
  orderDirection?: 'asc' | 'desc';
}
