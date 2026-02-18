import { EstadoLote, ModeloNegocio } from './enums';
import { Tanda } from './tanda.types';

export interface Lote {
  id: string;
  vendedorId: string;
  cantidadTrabix: number;
  modeloNegocio: ModeloNegocio;
  estado: EstadoLote;
  inversionTotal: number;
  inversionAdmin: number;
  inversionVendedor: number;
  dineroRecaudado: number;
  dineroTransferido: number;
  gananciaTotal: number;
  porcentajeRecaudo: number;
  inversionRecuperada: boolean;
  esLoteForzado: boolean;
  ventaMayorOrigenId: string | null;
  numeroTandas: number;
  maximoRegalos: number;
  tandas: Tanda[];
  fechaCreacion: string;
  fechaActivacion: string | null;
  fechaFinalizacion: string | null;
}

export interface LotesPaginados {
  data: Lote[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface SolicitarLoteRequest {
  cantidadTrabix: number;
}

export interface InfoSolicitudLote {
  cantidadMinima: number;
  costoPorTrabix: number;
  inversionTotalMinima: number;
  inversionVendedorMinima: number;
  lotesCreadosActuales: number;
  maxLotesCreados: number;
  puedeSolicitar: boolean;
}

export interface ResumenFinanciero {
  loteId: string;
  cantidadTrabix: number;
  modeloNegocio: ModeloNegocio;
  inversionTotal: number;
  inversionAdmin: number;
  inversionVendedor: number;
  dineroRecaudado: number;
  dineroTransferido: number;
  pendientePorTransferir: number;
  gananciaTotal: number;
  gananciaVendedor: number;
  gananciaAdmin: number;
  porcentajeRecaudo: number;
  inversionRecuperada: boolean;
  stockTotalDisponible: number;
  stockTotalVendido: number;
  regalosUtilizados: number;
  maximoRegalos: number;
}

export interface QueryLotesParams {
  vendedorId?: string;
  estado?: EstadoLote;
  modeloNegocio?: ModeloNegocio;
  esLoteForzado?: boolean;
  skip?: number;
  take?: number;
  cursor?: string;
  orderBy?: 'fechaCreacion' | 'fechaActivacion' | 'cantidadTrabix';
  orderDirection?: 'asc' | 'desc';
}
