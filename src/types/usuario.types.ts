import { Rol, EstadoUsuario, ModeloNegocio } from './enums';

export interface UsuarioBasico {
  id: string;
  nombre: string;
  apellidos: string;
  nombreCompleto: string;
  email: string;
  rol: Rol;
}

export interface Usuario {
  id: string;
  cedula: number;
  nombre: string;
  apellidos: string;
  nombreCompleto: string;
  email: string;
  telefono: string;
  rol: Rol;
  estado: EstadoUsuario;
  modeloNegocio: ModeloNegocio;
  requiereCambioPassword: boolean;
  reclutadorId: string | null;
  reclutador: UsuarioBasico | null;
  bloqueadoHasta: string | null;
  fechaCreacion: string;
  ultimoLogin: string | null;
  fechaCambioEstado: string | null;
}

export interface ResumenGanancias {
  totalVentas: number;
  trabixVendidos: number;
  ingresosBrutos: number;
  gananciasVendedor: number;
  lotesActivos: number;
  lotesFinalizados: number;
}

export interface UsuarioJerarquia {
  usuario: UsuarioBasico;
  ganancias?: ResumenGanancias;
  reclutados: UsuarioJerarquia[];
  totalReclutados: number;
  nivel: number;
}

export interface UsuariosPaginados {
  data: Usuario[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface CreateUsuarioRequest {
  cedula: number;
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  reclutadorId?: string;
}

export interface UpdateUsuarioRequest {
  nombre?: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
}

export interface CambiarEstadoRequest {
  estado: EstadoUsuario;
}

export interface QueryUsuariosParams {
  search?: string;
  cedula?: number;
  rol?: Rol;
  estado?: EstadoUsuario;
  bloqueado?: boolean;
  reclutadorId?: string;
  eliminado?: boolean;
  skip?: number;
  take?: number;
  cursor?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface CreateUsuarioResponse {
  usuario: Usuario;
  passwordTemporal: string;
  message: string;
}
