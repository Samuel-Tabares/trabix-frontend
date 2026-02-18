import { EstadoCuadre, ModalidadVentaMayor } from './enums';
import { UsuarioBasico } from './usuario.types';

export interface CuadreMayor {
  id: string;
  ventaMayorId: string;
  vendedorId: string;
  modalidad: ModalidadVentaMayor;
  estado: EstadoCuadre;
  cantidadUnidades: number;
  precioUnidad: number;
  ingresoBruto: number;
  montoTotalAdmin: number;
  montoTotalVendedor: number;
  deudasSaldadas: number;
  inversionAdminLotesExistentes: number;
  inversionAdminLoteForzado: number;
  inversionVendedorLotesExistentes: number;
  inversionVendedorLoteForzado: number;
  gananciasAdmin: number;
  gananciasVendedor: number;
  evaluacionFinanciera: Record<string, unknown>;
  lotesInvolucradosIds: string[];
  tandasAfectadas: Record<string, unknown>;
  cuadresCerradosIds: string[];
  loteForzadoId: string | null;
  gananciasReclutadores: { reclutadorId: string; nivel: number; monto: number }[];
  vendedorNombre?: string;
  vendedor?: UsuarioBasico;
  fechaRegistro: string;
  fechaExitoso: string | null;
}

export interface CuadresMayorPaginados {
  data: CuadreMayor[];
  total: number;
  hasMore: boolean;
}

export interface QueryCuadresMayorParams {
  estado?: EstadoCuadre;
  vendedorId?: string;
  skip?: number;
  take?: number;
}
