'use client';

import { useRouter } from 'next/navigation';
import { LogOut, User, Shield, Package, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { EstadoBadge } from '@/components/shared/estado-badge';
import { useCurrentUser } from '@/lib/hooks/use-auth';
import { useMiEquipamiento, useSolicitarEquipamiento } from '@/lib/hooks/use-equipamiento';
import { useAuthStore } from '@/lib/store/auth.store';
import { authApi } from '@/lib/api/auth.api';
import { formatCOP, formatDate } from '@/lib/utils/format';
import { EstadoEquipamiento } from '@/types/enums';

export default function PerfilPage() {
  const router = useRouter();
  const { data: usuario, isLoading: loadingUser } = useCurrentUser();
  const { data: equipamiento, isLoading: loadingEquip } = useMiEquipamiento();
  const solicitarEquip = useSolicitarEquipamiento();
  const logout = useAuthStore((s) => s.logout);
  const accessToken = useAuthStore((s) => s.accessToken);

  const handleLogout = async () => {
    try {
      // refreshToken viaja en cookie HttpOnly — solo pasamos accessToken para blacklistarlo
      await authApi.logout(accessToken ?? undefined);
    } catch {
      // ignore logout API errors
    }
    logout();
    document.cookie = 'trabix-auth=;path=/;max-age=0';
    router.push('/login');
  };

  const DEPOSITO = Number(process.env.NEXT_PUBLIC_DEPOSITO_EQUIPAMIENTO ?? 49990);
  const MENSUALIDAD_CON = Number(process.env.NEXT_PUBLIC_MENSUALIDAD_CON_DEPOSITO ?? 9990);
  const MENSUALIDAD_SIN = Number(process.env.NEXT_PUBLIC_MENSUALIDAD_SIN_DEPOSITO ?? 19990);

  const handleSolicitarEquipamiento = async (tieneDeposito: boolean) => {
    try {
      await solicitarEquip.mutateAsync({ tieneDeposito });
      toast.success('Equipamiento solicitado exitosamente');
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Error al solicitar equipamiento';
      toast.error(message);
    }
  };

  const noEquipamiento = !equipamiento && !loadingEquip;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Mi Perfil</h1>

      {/* User info */}
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

      {/* Equipamiento */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4" />
            Equipamiento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loadingEquip ? (
            <Skeleton className="h-20 w-full" />
          ) : noEquipamiento ? (
            <div className="space-y-3 py-1">
              <p className="text-sm text-muted-foreground text-center">
                Elige una opción para solicitar equipamiento:
              </p>
              <div className="grid grid-cols-2 gap-3">
                {/* Con depósito */}
                <div className="rounded-lg border p-3 space-y-2">
                  <p className="text-sm font-semibold">Con depósito</p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Depósito inicial</span>
                      <span className="font-medium text-foreground">{formatCOP(DEPOSITO)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mensualidad</span>
                      <span className="font-medium text-foreground">{formatCOP(MENSUALIDAD_CON)}/mes</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => handleSolicitarEquipamiento(true)}
                    disabled={solicitarEquip.isPending}
                  >
                    {solicitarEquip.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    )}
                    Solicitar
                  </Button>
                </div>

                {/* Sin depósito */}
                <div className="rounded-lg border p-3 space-y-2">
                  <p className="text-sm font-semibold">Sin depósito</p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Depósito inicial</span>
                      <span className="font-medium text-foreground">$0</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mensualidad</span>
                      <span className="font-medium text-foreground">{formatCOP(MENSUALIDAD_SIN)}/mes</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleSolicitarEquipamiento(false)}
                    disabled={solicitarEquip.isPending}
                  >
                    {solicitarEquip.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 mr-1" />
                    )}
                    Solicitar
                  </Button>
                </div>
              </div>
            </div>
          ) : equipamiento ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estado</span>
                <EstadoBadge estado={equipamiento.estado} />
              </div>
              {equipamiento.tieneDeposito && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Depósito</span>
                  <span className="font-medium">
                    {equipamiento.depositoPagado != null
                      ? formatCOP(equipamiento.depositoPagado)
                      : 'Pendiente'}
                  </span>
                </div>
              )}
              {equipamiento.estado === EstadoEquipamiento.ACTIVO && (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mensualidad</span>
                    <span className={equipamiento.mensualidadAlDia ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      {equipamiento.mensualidadAlDia ? 'Al día' : `${equipamiento.diasMoraMensualidad} días mora`}
                    </span>
                  </div>
                  {equipamiento.mensualidadesPendientes > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pendientes</span>
                      <span className="font-medium">
                        {equipamiento.mensualidadesPendientes} ({formatCOP(equipamiento.montoMensualidadesPendientes)})
                      </span>
                    </div>
                  )}
                  {equipamiento.tieneDeuda && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Deuda total</span>
                      <span className="font-medium text-red-600">
                        {formatCOP(equipamiento.deudaTotalConMensualidades)}
                      </span>
                    </div>
                  )}
                  {equipamiento.fechaEntrega && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Entregado</span>
                      <span>{formatDate(equipamiento.fechaEntrega)}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Actions */}
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
