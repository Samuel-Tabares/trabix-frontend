'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCrearLote } from '@/lib/hooks/use-lotes';
import { useUsuarios } from '@/lib/hooks/use-usuarios';
import { Rol, EstadoUsuario } from '@/types/enums';
import { toast } from 'sonner';

export default function CrearLotePage() {
  const router = useRouter();
  const crear = useCrearLote();
  const { data: vendedores } = useUsuarios({ rol: Rol.VENDEDOR, estado: EstadoUsuario.ACTIVO, take: 100 });

  const [vendedorId, setVendedorId] = useState('');
  const [cantidad, setCantidad] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    crear.mutate(
      { vendedorId, cantidadTrabix: Number(cantidad) },
      {
        onSuccess: () => { toast.success('Lote creado'); router.push('/lotes'); },
        onError: (err) => toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error al crear lote'),
      },
    );
  };

  return (
    <div className="space-y-4 max-w-lg">
      <div className="flex items-center gap-2">
        <Link href="/lotes"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="text-2xl font-bold">Crear Lote</h1>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Nuevo lote para vendedor</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Vendedor</Label>
              <Select value={vendedorId} onValueChange={setVendedorId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar vendedor" /></SelectTrigger>
                <SelectContent>
                  {vendedores?.data.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.nombre} {v.apellidos}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cantidad TRABIX</Label>
              <Input type="number" min="1" value={cantidad} onChange={(e) => setCantidad(e.target.value)} required />
            </div>
            <Button type="submit" disabled={crear.isPending || !vendedorId} className="w-full">
              {crear.isPending ? 'Creando...' : 'Crear Lote'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
