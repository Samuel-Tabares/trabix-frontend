import type { ApiError } from '@/types/api.types';

/**
 * Extrae el mensaje legible de un error de Axios/API.
 * El backend siempre envía { statusCode, errorCode, message, ... }
 * @param err - El error capturado en un bloque catch
 * @param fallback - Mensaje por defecto si no se puede extraer uno del error
 */
export function getApiError(err: unknown, fallback: string): string {
  const data = (err as { response?: { data?: Partial<ApiError> } })?.response?.data;

  if (!data) return fallback;

  // Mensaje humano del backend
  if (typeof data.message === 'string' && data.message.length > 0) {
    return data.message;
  }

  return fallback;
}
