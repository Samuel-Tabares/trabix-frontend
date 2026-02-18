import { EstadoTanda } from './enums';

export interface Tanda {
  id: string;
  loteId: string;
  numero: number;
  estado: EstadoTanda;
  stockInicial: number;
  stockActual: number;
  stockConsumidoPorMayor: number;
  porcentajeStockRestante: number;
  fechaLiberacion: string | null;
  fechaEnTransito: string | null;
  fechaEnCasa: string | null;
  fechaFinalizada: string | null;
}
