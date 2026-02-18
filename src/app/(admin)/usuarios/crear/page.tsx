'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCrearUsuario, useUsuarios } from '@/lib/hooks/use-usuarios';
import { Rol } from '@/types/enums';
import { toast } from 'sonner';

export default function CrearUsuarioPage() {
  const router = useRouter();
  const crear = useCrearUsuario();
  const { data: vendedores } = useUsuarios({ rol: Rol.VENDEDOR, take: 100 });

  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [reclutadorId, setReclutadorId] = useState<string>('none');
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    crear.mutate(
      {
        cedula: Number(cedula),
        nombre,
        apellidos,
        email,
        telefono,
        reclutadorId: reclutadorId !== 'none' ? reclutadorId : undefined,
      },
      {
        onSuccess: (res) => {
          setTempPassword(res.passwordTemporal);
          toast.success('Usuario creado exitosamente');
        },
        onError: (err) => {
          toast.error(
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
              'Error al crear usuario',
          );
        },
      },
    );
  };

  return (
    <div className="space-y-4 max-w-lg">
      <div className="flex items-center gap-2">
        <Link href="/usuarios">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold">Crear Usuario</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos del nuevo usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Cédula</Label>
              <Input type="number" value={cedula} onChange={(e) => setCedula(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Apellidos</Label>
                <Input value={apellidos} onChange={(e) => setApellidos(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Reclutador (opcional)</Label>
              <Select value={reclutadorId} onValueChange={setReclutadorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sin reclutador" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin reclutador</SelectItem>
                  {vendedores?.data.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.nombre} {v.apellidos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={crear.isPending} className="w-full">
              {crear.isPending ? 'Creando...' : 'Crear Usuario'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={!!tempPassword} onOpenChange={(open) => { if (!open) { setTempPassword(null); router.push('/usuarios'); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Usuario Creado</DialogTitle>
            <DialogDescription>
              Comparte esta contraseña temporal con el usuario. Solo se mostrará una vez.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-md border p-3 bg-muted">
            <code className="flex-1 text-lg font-mono">{tempPassword}</code>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                navigator.clipboard.writeText(tempPassword ?? '');
                toast.success('Contraseña copiada');
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
