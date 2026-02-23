'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useEnviarNotificacion } from '@/lib/hooks/use-notificaciones';
import { useUsuarios } from '@/lib/hooks/use-usuarios';
import { TipoNotificacion, CanalNotificacion } from '@/types/enums';
import { getApiError } from '@/lib/utils/errors';
import { toast } from 'sonner';

export default function EnviarNotificacionPage() {
  const router = useRouter();
  const enviar = useEnviarNotificacion();
  const { data: usuarios } = useUsuarios({ take: 100 });

  const [usuarioId, setUsuarioId] = useState('');
  const [tipo, setTipo] = useState<string>(TipoNotificacion.MANUAL);
  const [canal, setCanal] = useState<string>(CanalNotificacion.WEBSOCKET);
  const [titulo, setTitulo] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    enviar.mutate(
      {
        usuarioId,
        tipo: tipo as TipoNotificacion,
        canal: canal as CanalNotificacion,
        titulo: titulo || undefined,
        mensaje: mensaje || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Notificación enviada');
          router.push('/notificaciones');
        },
        onError: (err) => {
          toast.error(getApiError(err, 'Error al enviar la notificación'));
        },
      },
    );
  };

  return (
    <div className="space-y-4 max-w-lg">
      <div className="flex items-center gap-2">
        <Link href="/notificaciones"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="text-2xl font-bold">Enviar Notificación</h1>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Datos</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Usuario</Label>
              <Select value={usuarioId} onValueChange={setUsuarioId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar usuario" /></SelectTrigger>
                <SelectContent>
                  {usuarios?.data?.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.nombre} {u.apellidos} ({u.rol})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.values(TipoNotificacion).map((t) => (
                      <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Canal</Label>
                <Select value={canal} onValueChange={setCanal}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.values(CanalNotificacion).map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Título (opcional)</Label>
              <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Mensaje (opcional)</Label>
              <Textarea value={mensaje} onChange={(e) => setMensaje(e.target.value)} placeholder="Contenido de la notificación..." />
            </div>
            <Button type="submit" disabled={enviar.isPending || !usuarioId}>
              {enviar.isPending ? 'Enviando...' : 'Enviar Notificación'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
