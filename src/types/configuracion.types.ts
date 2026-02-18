export interface ConfiguracionSistema {
  id: string;
  clave: string;
  valor: string;
  tipo: string;
  descripcion: string;
  categoria: string;
  modificable: boolean;
  ultimaModificacion: string;
}

export interface HistorialConfiguracion {
  id: string;
  clave: string;
  valorAnterior: string;
  valorNuevo: string;
  modificadoPorId: string;
  motivo: string | null;
  fechaCambio: string;
}

export interface TipoInsumo {
  id: string;
  nombre: string;
  esObligatorio: boolean;
  activo: boolean;
  fechaCreacion: string;
}

export interface ModificarConfiguracionRequest {
  valor: string;
  motivo?: string;
}

export interface CrearTipoInsumoRequest {
  nombre: string;
  esObligatorio?: boolean;
}

export interface ModificarTipoInsumoRequest {
  nombre?: string;
}

export interface HistorialConfiguracionPaginado {
  data: HistorialConfiguracion[];
  total: number;
  hasMore: boolean;
}
