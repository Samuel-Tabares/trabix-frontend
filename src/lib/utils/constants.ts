export const ESTADO_COLORS: Record<string, string> = {
  // Success states
  ACTIVO: 'bg-green-100 text-green-800',
  APROBADA: 'bg-green-100 text-green-800',
  EXITOSO: 'bg-green-100 text-green-800',
  EN_CASA: 'bg-green-100 text-green-800',

  // Pending states
  PENDIENTE: 'bg-yellow-100 text-yellow-800',
  CREADO: 'bg-yellow-100 text-yellow-800',
  BORRADOR: 'bg-yellow-100 text-yellow-800',
  SOLICITADO: 'bg-yellow-100 text-yellow-800',

  // Inactive states
  INACTIVO: 'bg-gray-100 text-gray-600',
  INACTIVA: 'bg-gray-100 text-gray-600',

  // Blocked state
  BLOQUEADO: 'bg-orange-100 text-orange-800',

  // Error states
  RECHAZADA: 'bg-red-100 text-red-800',
  CANCELADO: 'bg-red-100 text-red-800',
  PERDIDO: 'bg-red-100 text-red-800',
  DANADO: 'bg-red-100 text-red-800',

  // Progress states
  EN_TRANSITO: 'bg-blue-100 text-blue-800',

  // Completed states
  FINALIZADO: 'bg-slate-100 text-slate-700',
  FINALIZADA: 'bg-slate-100 text-slate-700',
  COMPLETADA: 'bg-slate-100 text-slate-700',
  DEVUELTO: 'bg-slate-100 text-slate-700',
  RECIBIDO: 'bg-slate-100 text-slate-700',
};
