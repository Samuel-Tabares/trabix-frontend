export enum Rol {
  ADMIN = 'ADMIN',
  VENDEDOR = 'VENDEDOR',
  RECLUTADOR = 'RECLUTADOR',
}

export enum EstadoUsuario {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
}

export enum EstadoLote {
  CREADO = 'CREADO',
  ACTIVO = 'ACTIVO',
  FINALIZADO = 'FINALIZADO',
}

export enum ModeloNegocio {
  MODELO_60_40 = 'MODELO_60_40',
  MODELO_50_50 = 'MODELO_50_50',
}

export enum EstadoTanda {
  INACTIVA = 'INACTIVA',
  EN_TRANSITO = 'EN_TRANSITO',
  EN_CASA = 'EN_CASA',
  FINALIZADA = 'FINALIZADA',
}

export enum TipoVenta {
  PROMO = 'PROMO',
  UNIDAD = 'UNIDAD',
  SIN_LICOR = 'SIN_LICOR',
  REGALO = 'REGALO',
}

export enum EstadoVentaMayor {
  PENDIENTE = 'PENDIENTE',
  COMPLETADA = 'COMPLETADA',
}

export enum ModalidadVentaMayor {
  ANTICIPADO = 'ANTICIPADO',
  CONTRAENTREGA = 'CONTRAENTREGA',
}

export enum EstadoCuadre {
  INACTIVO = 'INACTIVO',
  PENDIENTE = 'PENDIENTE',
  EXITOSO = 'EXITOSO',
}

export enum ConceptoCuadre {
  INVERSION_ADMIN = 'INVERSION_ADMIN',
  GANANCIAS = 'GANANCIAS',
  MIXTO = 'MIXTO',
}

export enum EstadoMiniCuadre {
  INACTIVO = 'INACTIVO',
  PENDIENTE = 'PENDIENTE',
  EXITOSO = 'EXITOSO',
}

export enum EstadoEquipamiento {
  SOLICITADO = 'SOLICITADO',
  ACTIVO = 'ACTIVO',
  DEVUELTO = 'DEVUELTO',
  DANADO = 'DANADO',
  PERDIDO = 'PERDIDO',
}

export enum EstadoPedidoStock {
  BORRADOR = 'BORRADOR',
  RECIBIDO = 'RECIBIDO',
}

export enum TipoNotificacion {
  STOCK_BAJO = 'STOCK_BAJO',
  CUADRE_PENDIENTE = 'CUADRE_PENDIENTE',
  INVERSION_RECUPERADA = 'INVERSION_RECUPERADA',
  CUADRE_EXITOSO = 'CUADRE_EXITOSO',
  TANDA_LIBERADA = 'TANDA_LIBERADA',
  MANUAL = 'MANUAL',
  PREMIO_RECIBIDO = 'PREMIO_RECIBIDO',
  LOTE_ACTIVADO = 'LOTE_ACTIVADO',
  LOTE_FINALIZADO = 'LOTE_FINALIZADO',
  EQUIPAMIENTO_SOLICITADO = 'EQUIPAMIENTO_SOLICITADO',
  EQUIPAMIENTO_ENTREGADO = 'EQUIPAMIENTO_ENTREGADO',
  FONDO_EGRESO = 'FONDO_EGRESO',
}

export enum TipoTransaccionFondo {
  ENTRADA = 'ENTRADA',
  SALIDA = 'SALIDA',
}

/**
 * Canal de notificación activo.
 * En el futuro se pueden agregar: PUSH (Firebase/OneSignal), EMAIL, WHATSAPP (Business API), etc.
 */
export enum CanalNotificacion {
  WEBSOCKET = 'WEBSOCKET',
}
