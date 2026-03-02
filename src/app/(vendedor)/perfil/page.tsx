'use client';

import { useRouter } from 'next/navigation';
import { LogOut, User, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { EstadoBadge } from '@/components/shared/estado-badge';
import { useCurrentUser } from '@/lib/hooks/use-auth';
import { useAuthStore } from '@/lib/store/auth.store';
import { authApi } from '@/lib/api/auth.api';
import { formatDate } from '@/lib/utils/format';

export default function PerfilPage() {
  const router = useRouter();
  const { data: usuario, isLoading: loadingUser } = useCurrentUser();
  const logout = useAuthStore((s) => s.logout);
  const accessToken = useAuthStore((s) => s.accessToken);

  const handleLogout = async () => {
    try {
      await authApi.logout(accessToken ?? undefined);
    } catch {
      // ignore logout API errors
    }
    logout();
    document.cookie = 'trabix-auth=;path=/;max-age=0';
    router.push('/login');
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Mi Perfil</h1>

      {loadingUser ? (
        <Skeleton className="h-32 w-full" />
      ) : usuario ? (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{usuario.nombreCompleto}</p>
                <p className="text-sm text-muted-foreground">{usuario.email}</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cédula</span>
                <span className="font-medium">{usuario.cedula}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Teléfono</span>
                <span className="font-medium">{usuario.telefono}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rol</span>
                <div className="flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium">{usuario.rol}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Modelo</span>
                <span className="font-medium">{usuario.modeloNegocio.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estado</span>
                <EstadoBadge estado={usuario.estado} />
              </div>
              {usuario.reclutador && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reclutador</span>
                  <span className="font-medium">{usuario.reclutador.nombreCompleto}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Miembro desde</span>
                <span>{formatDate(usuario.fechaCreacion)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground text-center px-2">
          Para cambiar tu contraseña, contacta directamente al administrador.
        </p>
        <Button
          variant="destructive"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
}
