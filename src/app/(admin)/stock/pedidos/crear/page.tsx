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
import { useCrearPedido } from '@/lib/hooks/use-pedidos-stock';
import { toast } from 'sonner';

export default function CrearPedidoStockPage() {
  const router = useRouter();
  const crear = useCrearPedido();
  const [cantidad, setCantidad] = useState('');
  const [notas, setNotas] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    crear.mutate(
      { cantidadTrabix: Number(cantidad), notas: notas || undefined },
      {
        onSuccess: () => {
          toast.success('Pedido de stock creado');
          router.push('/stock');
        },
        onError: (err) => {
          toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error al crear pedido');
        },
      },
    );
  };

  return (
    <div className="space-y-4 max-w-lg">
      <div className="flex items-center gap-2">
        <Link href="/stock"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="text-2xl font-bold">Nuevo Pedido de Stock</h1>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Datos del Pedido</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Cantidad de Trabix</Label>
              <Input type="number" min={1} value={cantidad} onChange={(e) => setCantidad(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Notas (opcional)</Label>
              <Textarea value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Notas adicionales..." />
            </div>
            <Button type="submit" disabled={crear.isPending || !cantidad}>
              {crear.isPending ? 'Creando...' : 'Crear Pedido'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
