'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
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
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from '@/lib/validators/auth.schema';
import { authApi } from '@/lib/api/auth.api';
import { useAuthStore } from '@/lib/store/auth.store';
import { Rol } from '@/types/enums';
import type { ApiError } from '@/types/api.types';

export function ChangePasswordForm() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (values: ChangePasswordFormValues) => {
    setError(null);
    try {
      await authApi.cambiarPassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      toast.success('Contraseña cambiada exitosamente');

      // Update in-memory store so middleware (proxy)/guards see the change immediately
      updateUser({ requiereCambioPassword: false });

      // Update cookie to reflect password change
      const authCookie = document.cookie
        .split('; ')
        .find((c) => c.startsWith('trabix-auth='));
      if (authCookie) {
        try {
          const parsed = JSON.parse(
            decodeURIComponent(authCookie.split('=').slice(1).join('=')),
          );
          if (parsed.state?.user) {
            parsed.state.user.requiereCambioPassword = false;
          }
          document.cookie = `trabix-auth=${encodeURIComponent(JSON.stringify(parsed))};path=/;max-age=${60 * 60 * 24 * 30};SameSite=Strict`;
        } catch {
          // ignore cookie parse errors
        }
      }

      const redirectUrl =
        user?.rol === Rol.ADMIN ? '/dashboard' : '/inicio';
      router.push(redirectUrl);
    } catch (err) {
      if (err instanceof AxiosError) {
        const apiError = err.response?.data as ApiError | undefined;
        if (err.response?.status === 400) {
          setError(apiError?.message ?? 'Contraseña actual incorrecta');
        } else {
          setError(apiError?.message ?? 'Error al cambiar la contraseña');
        }
      } else {
        setError('Error de conexión. Verifica tu red.');
      }
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Cambiar Contraseña</CardTitle>
        <CardDescription>
          Debes cambiar tu contraseña temporal para continuar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="currentPassword">Contraseña Actual</Label>
            <Input
              id="currentPassword"
              type="password"
              placeholder="Ingresa tu contraseña actual"
              {...register('currentPassword')}
            />
            {errors.currentPassword && (
              <p className="text-sm text-destructive">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nueva Contraseña</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Ingresa tu nueva contraseña"
              {...register('newPassword')}
            />
            {errors.newPassword && (
              <p className="text-sm text-destructive">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmarPassword">Confirmar Contraseña</Label>
            <Input
              id="confirmarPassword"
              type="password"
              placeholder="Confirma tu nueva contraseña"
              {...register('confirmarPassword')}
            />
            {errors.confirmarPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmarPassword.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Cambiar Contraseña
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
