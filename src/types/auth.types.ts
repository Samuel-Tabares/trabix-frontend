import { Rol } from './enums';

export interface UserInfo {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  rol: Rol;
  requiereCambioPassword: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserInfo;
}

export interface LoginRequest {
  cedula: number;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
  accessToken?: string;
}

export interface ResetPasswordResponse {
  message: string;
  passwordTemporal: string;
  usuarioId: string;
  nombreUsuario: string;
}
