import { EstadoMiniCuadre } from './enums';

export interface MiniCuadre {
  id: string;
  loteId: string;
  tandaId: string;
  estado: EstadoMiniCuadre;
  montoFinal: number;
  lote?: { id: string; vendedorId: string; cantidadTrabix: number };
  fechaPendiente: string | null;
  fechaExitoso: string | null;
}
