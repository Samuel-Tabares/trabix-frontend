import { EstadoVentaMayor, ModalidadVentaMayor } from './enums';
import { UsuarioBasico } from './usuario.types';

export interface VentaMayor {
  id: string;
  vendedorId: string;
  vendedor?: UsuarioBasico;
  cantidadUnidades: number;
  precioUnidad: number;
  ingresoBruto: number;
  conLicor: boolean;
  modalidad: ModalidadVentaMayor;
  estado: EstadoVentaMayor;
  fuentesStock?: FuenteStock[];
  lotesInvolucradosIds?: string[];
  loteForzadoId?: string | null;
  cuadreMayorId?: string | null;
  fechaRegistro: string;
  fechaCompletada: string | null;
}

export interface FuenteStock {
  tandaId: string;
  cantidadConsumida: number;
  tipoStock: string;
}

export interface VentasMayorPaginadas {
  data: VentaMayor[];
  total: number;
  hasMore: boolean;
}

export interface QueryVentasMayorParams {
  estado?: EstadoVentaMayor;
  vendedorId?: string;
  skip?: number;
  take?: number;
}

export interface RegistrarVentaMayorRequest {
  cantidadUnidades: number;
  conLicor: boolean;
  modalidad: ModalidadVentaMayor;
}

export interface StockDisponibleResponse {
  stockReservado: number;
  stockEnCasa: number;
  stockTotal: number;
  cantidadMaximaSinLoteForzado: number;
}
