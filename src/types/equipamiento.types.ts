import { EstadoEquipamiento } from './enums';

export interface VendedorInfo {
  id: string;
  nombre: string;
  apellidos: string;
  cedula: number;
  telefono: string;
}

export interface Equipamiento {
  id: string;
  vendedorId: string;
  vendedor?: VendedorInfo;
  estado: EstadoEquipamiento;
  tieneDeposito: boolean;
  depositoPagado: number | null;
  mensualidadActual: number;
  ultimaMensualidadPagada: string | null;
  deudaDano: number;
  deudaPerdida: number;
  fechaSolicitud: string;
  fechaEntrega: string | null;
  fechaDevolucion: string | null;
  depositoDevuelto: boolean;
  fechaDevolucionDeposito: string | null;
  // Calculated fields
  mensualidadAlDia: boolean;
  diasMoraMensualidad: number;
  mensualidadesPendientes: number;
  montoMensualidadesPendientes: number;
  deudaTotal: number;
  deudaTotalConMensualidades: number;
  tieneDeuda: boolean;
}

export interface SolicitarEquipamientoRequest {
  tieneDeposito: boolean;
}

export interface EquipamientosPaginados {
  data: Equipamiento[];
  total: number;
  hasMore: boolean;
}

export interface ReportarDanoRequest {
  tipoDano: 'NEVERA' | 'PIJAMA';
}

export interface PagarDeudaRequest {
  monto: number;
}

export interface QueryEquipamientosParams {
  estado?: EstadoEquipamiento;
  vendedorId?: string;
  skip?: number;
  take?: number;
}
