import { TipoTransaccionFondo } from './enums';

export interface SaldoFondo {
  saldo: number;
}

export interface TransaccionFondo {
  id: string;
  tipo: TipoTransaccionFondo;
  monto: number;
  motivo: string | null;
  loteOrigenId: string | null;
  fechaTransaccion: string;
}

export interface MovimientoFondo {
  id: string;
  tipo: string;
  monto: number;
  concepto: string;
  loteId?: string;
  vendedorBeneficiarioId?: string;
  fechaTransaccion: string;
}

export interface TransaccionesPaginadas {
  data: MovimientoFondo[];
  total: number;
  hasMore: boolean;
}

export interface RegistrarSalidaRequest {
  monto: number;
  concepto: string;
  vendedorBeneficiarioId: string;
}

export interface QueryTransaccionesParams {
  tipo?: string;
  skip?: number;
  take?: number;
}
