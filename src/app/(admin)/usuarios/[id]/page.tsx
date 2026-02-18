'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Edit2, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EstadoBadge } from '@/components/shared/estado-badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import {
  useUsuario,
  useActualizarUsuario,
  useCambiarEstadoUsuario,
  useResetPassword,
  useDesbloquearUsuario,
  useEliminarUsuario,
} from '@/lib/hooks/use-usuarios';
import { EstadoUsuario } from '@/types/enums';
import { formatDate, formatDateTime } from '@/lib/utils/format';
import { toast } from 'sonner';

export default function UsuarioDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: usuario, isLoading } = useUsuario(id);
  const actualizar = useActualizarUsuario();
  const cambiarEstado = useCambiarEstadoUsuario();
  const resetPw = useResetPassword();
  const desbloquear = useDesbloquearUsuario();
  const eliminar = useEliminarUsuario();

  const [editing, setEditing] = useState(false);
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');

  const [confirmEstado, setConfirmEstado] = useState(false);
  const [confirmEliminar, setConfirmEliminar] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const startEdit = () => {
    if (!usuario) return;
    setNombre(usuario.nombre);
    setApellidos(usuario.apellidos);
    setEmail(usuario.email);
    setTelefono(usuario.telefono);
    setEditing(true);
  };

  const saveEdit = () => {
    actualizar.mutate(
      { id, data: { nombre, apellidos, email, telefono } },
      {
        onSuccess: () => { toast.success('Usuario actualizado'); setEditing(false); },
        onError: () => toast.error('Error al actualizar'),
      },
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (!usuario) return <p className="text-muted-foreground">Usuario no encontrado</p>;

  const nuevoEstado = usuario.estado === EstadoUsuario.ACTIVO ? EstadoUsuario.INACTIVO : EstadoUsuario.ACTIVO;

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center gap-2">
        <Link href="/usuarios"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="text-2xl font-bold">{usuario.nombre} {usuario.apellidos}</h1>
        <EstadoBadge estado={usuario.estado} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Información</CardTitle>
          {!editing && (
            <Button variant="outline" size="sm" onClick={startEdit}>
              <Edit2 className="mr-2 h-3 w-3" /> Editar
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {editing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Nombre</Label>
                  <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Apellidos</Label>
                  <Input value={apellidos} onChange={(e) => setApellidos(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Teléfono</Label>
                <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button onClick={saveEdit} disabled={actualizar.isPending}>
                  {actualizar.isPending ? 'Guardando...' : 'Guardar'}
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)}>Cancelar</Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-muted-foreground">Cédula</p><p className="font-medium">{usuario.cedula}</p></div>
              <div><p className="text-muted-foreground">Rol</p><EstadoBadge estado={usuario.rol} /></div>
              <div><p className="text-muted-foreground">Email</p><p className="font-medium">{usuario.email}</p></div>
              <div><p className="text-muted-foreground">Teléfono</p><p className="font-medium">{usuario.telefono}</p></div>
              <div><p className="text-muted-foreground">Modelo</p><p className="font-medium">{usuario.modeloNegocio.replace('MODELO_', '').replace('_', '/')}</p></div>
              <div><p className="text-muted-foreground">Creado</p><p>{formatDate(usuario.fechaCreacion)}</p></div>
              {usuario.ultimoLogin && (
                <div><p className="text-muted-foreground">Último login</p><p>{formatDateTime(usuario.ultimoLogin)}</p></div>
              )}
              {usuario.reclutador && (
                <div><p className="text-muted-foreground">Reclutador</p><p className="font-medium">{usuario.reclutador.nombre} {usuario.reclutador.apellidos}</p></div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Acciones</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setConfirmEstado(true)}>
            {usuario.estado === EstadoUsuario.ACTIVO ? 'Desactivar' : 'Activar'}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              resetPw.mutate(id, {
                onSuccess: (res) => { setTempPassword(res.passwordTemporal); },
                onError: () => toast.error('Error al resetear contraseña'),
              });
            }}
            disabled={resetPw.isPending}
          >
            Reset Password
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              desbloquear.mutate(id, {
                onSuccess: () => toast.success('Usuario desbloqueado'),
                onError: () => toast.error('Error al desbloquear'),
              });
            }}
            disabled={desbloquear.isPending}
          >
            Desbloquear
          </Button>
          <Link href={`/usuarios/${id}/jerarquia`}>
            <Button variant="outline"><GitBranch className="mr-2 h-4 w-4" />Jerarquía</Button>
          </Link>
          <Separator orientation="vertical" className="h-8" />
          <Button variant="destructive" onClick={() => setConfirmEliminar(true)}>
            Eliminar
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmEstado}
        onOpenChange={setConfirmEstado}
        title={`${usuario.estado === EstadoUsuario.ACTIVO ? 'Desactivar' : 'Activar'} usuario`}
        description={`¿Cambiar el estado de ${usuario.nombre} a ${nuevoEstado}?`}
        onConfirm={() => {
          cambiarEstado.mutate(
            { id, data: { estado: nuevoEstado } },
            {
              onSuccess: () => { toast.success('Estado actualizado'); setConfirmEstado(false); },
              onError: () => toast.error('Error al cambiar estado'),
            },
          );
        }}
        isLoading={cambiarEstado.isPending}
      />

      <ConfirmDialog
        open={confirmEliminar}
        onOpenChange={setConfirmEliminar}
        title="Eliminar usuario"
        description={`¿Estás seguro de eliminar a ${usuario.nombre}? Podrás restaurarlo después.`}
        variant="destructive"
        confirmLabel="Eliminar"
        onConfirm={() => {
          eliminar.mutate(id, {
            onSuccess: () => { toast.success('Usuario eliminado'); window.location.href = '/usuarios'; },
            onError: () => toast.error('Error al eliminar'),
          });
        }}
        isLoading={eliminar.isPending}
      />

      <Dialog open={!!tempPassword} onOpenChange={(open) => { if (!open) setTempPassword(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nueva Contraseña Temporal</DialogTitle></DialogHeader>
          <div className="flex items-center gap-2 rounded-md border p-3 bg-muted">
            <code className="flex-1 text-lg font-mono">{tempPassword}</code>
            <Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText(tempPassword ?? ''); toast.success('Copiada'); }}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
