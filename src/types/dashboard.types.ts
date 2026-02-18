export interface ResumenDashboard {
  ventasHoy: number;
  ingresosHoy: number;
  stockFisico: number;
  cuadresPendientes: number;
  vendedoresActivos: number;
  saldoFondo: number;
}

export interface VentasPeriodo {
  periodo: string;
  totalVentas: number;
  totalIngresos: number;
  trabixVendidos: number;
}

export interface VendedoresActivosDetalle {
  total: number;
  vendedores: number;
  reclutadores: number;
}

export interface CuadrePendienteResumen {
  cuadreId: string;
  tandaId: string;
  numeroTanda: number;
  vendedorNombre: string;
  montoEsperado: number;
  fechaPendiente: string;
}
