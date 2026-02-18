export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface ApiError {
  statusCode: number;
  errorCode: string;
  message: string;
  details?: unknown;
  timestamp: string;
}

export interface MessageResponse {
  message: string;
}
