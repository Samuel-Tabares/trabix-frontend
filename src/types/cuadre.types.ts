import { EstadoCuadre, ConceptoCuadre } from './enums';

export interface DesgloseCuadre {
  inversionAdmin: number;
  gananciasAdmin: number;
  mensualidades: number;
  deudaDano: number;
  deudaPerdida: number;
}

export interface TandaCuadre {
  id: string;
  loteId: string;
  numero: number;
  stockInicial: number;
  stockActual: number;
  estado: string;
}

export interface Cuadre {
  id: string;
  tandaId: string;
  vendedorId: string;
  estado: EstadoCuadre;
  concepto: ConceptoCuadre;
  montoEsperado: number;
  montoRecibido: number;
  montoFaltante: number;
  montoCubiertoPorMayor: number;
  montoEsperadoAjustado: number;
  cerradoPorCuadreMayorId: string | null;
  fechaPendiente: string | null;
  fechaExitoso: string | null;
  tanda: TandaCuadre;
  fueCerradoPorMayor: boolean;
  desglose?: DesgloseCuadre | null;
}

export interface CuadresPaginados {
  data: Cuadre[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface QueryCuadresParams {
  vendedorId?: string;
  estado?: EstadoCuadre;
  skip?: number;
  take?: number;
  cursor?: string;
}
