import { TipoNotificacion, CanalNotificacion } from './enums';

export interface Notificacion {
  id: string;
  usuarioId: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  datos: Record<string, unknown> | null;
  canal: CanalNotificacion;
  leida: boolean;
  fechaCreacion: string;
  fechaLeida: string | null;
}

export interface NotificacionesPaginadas {
  data: Notificacion[];
  total: number;
  noLeidas: number;
  hasMore: boolean;
}

export interface ContadorNotificaciones {
  noLeidas: number;
}

export interface QueryNotificacionesParams {
  soloNoLeidas?: boolean;
  skip?: number;
  take?: number;
  tipo?: TipoNotificacion;
}

export interface EnviarNotificacionRequest {
  usuarioId: string;
  titulo: string;
  mensaje: string;
  datos?: Record<string, unknown>;
}
