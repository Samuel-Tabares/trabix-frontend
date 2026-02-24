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
import { getApiError } from '@/lib/utils/errors';
import { toast } from 'sonner';

export default function EnviarNotificacionPage() {
  const router = useRouter();
  const enviar = useEnviarNotificacion();
  const { data: usuarios } = useUsuarios({ take: 100 });

  const [usuarioId, setUsuarioId] = useState('');
  const [titulo, setTitulo] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    enviar.mutate(
      { usuarioId, titulo, mensaje },
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
        <CardHeader><CardTitle className="text-base">Notificación manual</CardTitle></CardHeader>
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
            <div className="space-y-2">
              <Label>Título</Label>
              <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej: Información importante" required />
            </div>
            <div className="space-y-2">
              <Label>Mensaje</Label>
              <Textarea value={mensaje} onChange={(e) => setMensaje(e.target.value)} placeholder="Contenido de la notificación..." required />
            </div>
            <Button type="submit" disabled={enviar.isPending || !usuarioId || !titulo || !mensaje}>
              {enviar.isPending ? 'Enviando...' : 'Enviar Notificación'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
