'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { loginSchema, type LoginFormValues } from '@/lib/validators/auth.schema';
import { authApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/lib/store/auth.store';
import { Rol } from '@/types/enums';
import type { ApiError } from '@/types/api.types';

export function LoginForm() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setError(null);
    try {
      const response = await authApi.login({
        cedula: parseInt(values.cedula, 10),
        password: values.password,
      });

      login(response);

      // Set cookie for middleware — URL-encoded to handle special chars in user data,
      // SameSite=Strict to block cross-site request forgery.
      document.cookie = `trabix-auth=${encodeURIComponent(JSON.stringify({
        state: {
          isAuthenticated: true,
          user: response.user,
        },
      }))};path=/;max-age=${60 * 60 * 24 * 30};SameSite=Strict`;

      if (response.user.requiereCambioPassword) {
        router.push('/cambiar-password');
        return;
      }

      const redirectUrl =
        response.user.rol === Rol.ADMIN ? '/dashboard' : '/inicio';
      router.push(redirectUrl);
    } catch (err) {
      if (err instanceof AxiosError) {
        const apiError = err.response?.data as ApiError | undefined;
        if (err.response?.status === 401) {
          setError('Cédula o contraseña incorrecta');
        } else if (err.response?.status === 403) {
          setError('Tu cuenta está bloqueada. Contacta al administrador.');
        } else if (err.response?.status === 429) {
          setError('Demasiados intentos. Intenta de nuevo más tarde.');
        } else {
          setError(apiError?.message ?? 'Error al iniciar sesión');
        }
      } else {
        setError('Error de conexión. Verifica tu red.');
      }
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">TRABIX</CardTitle>
        <CardDescription>Inicia sesión para continuar</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="cedula">Cédula</Label>
            <Input
              id="cedula"
              type="text"
              inputMode="numeric"
              placeholder="Ingresa tu cédula"
              {...register('cedula')}
            />
            {errors.cedula && (
              <p className="text-sm text-destructive">
                {errors.cedula.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="Ingresa tu contraseña"
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Iniciar Sesión
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
