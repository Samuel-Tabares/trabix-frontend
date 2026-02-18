'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EstadoBadge } from '@/components/shared/estado-badge';
import { useCuadre, useConfirmarCuadre } from '@/lib/hooks/use-cuadres';
import { formatCOP, formatDate } from '@/lib/utils/format';
import { toast } from 'sonner';

export default function CuadreDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: cuadre, isLoading } = useCuadre(id);
  const confirmar = useConfirmarCuadre();
  const [montoRecibido, setMontoRecibido] = useState('');

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-60 w-full" /></div>;
  if (!cuadre) return <p className="text-muted-foreground">Cuadre no encontrado</p>;

  const handleConfirmar = () => {
    confirmar.mutate(
      { id, montoRecibido: Number(montoRecibido) },
      {
        onSuccess: () => toast.success('Cuadre confirmado'),
        onError: () => toast.error('Error al confirmar cuadre'),
      },
    );
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center gap-2">
        <Link href="/cuadres"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="text-2xl font-bold">Cuadre</h1>
        <EstadoBadge estado={cuadre.estado} />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Información</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-muted-foreground">Concepto</p><p className="font-medium">{cuadre.concepto.replace(/_/g, ' ')}</p></div>
          <div><p className="text-muted-foreground">Tanda</p><p className="font-medium">#{cuadre.tanda.numero}</p></div>
          <div><p className="text-muted-foreground">Monto Esperado</p><p className="font-semibold">{formatCOP(cuadre.montoEsperado)}</p></div>
          <div><p className="text-muted-foreground">Monto Esperado Ajustado</p><p className="font-semibold">{formatCOP(cuadre.montoEsperadoAjustado)}</p></div>
          <div><p className="text-muted-foreground">Monto Recibido</p><p className="font-semibold">{formatCOP(cuadre.montoRecibido)}</p></div>
          <div><p className="text-muted-foreground">Monto Faltante</p><p className="font-semibold text-red-600">{formatCOP(cuadre.montoFaltante)}</p></div>
          {cuadre.montoCubiertoPorMayor > 0 && (
            <div><p className="text-muted-foreground">Cubierto por Mayor</p><p className="font-semibold">{formatCOP(cuadre.montoCubiertoPorMayor)}</p></div>
          )}
          {cuadre.fechaPendiente && <div><p className="text-muted-foreground">Fecha Pendiente</p><p>{formatDate(cuadre.fechaPendiente)}</p></div>}
          {cuadre.fechaExitoso && <div><p className="text-muted-foreground">Fecha Exitoso</p><p>{formatDate(cuadre.fechaExitoso)}</p></div>}
        </CardContent>
      </Card>

      {cuadre.estado === 'PENDIENTE' && (
        <Card>
          <CardHeader><CardTitle className="text-base">Confirmar Cuadre</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Monto Recibido</Label>
              <Input type="number" step="0.01" value={montoRecibido} onChange={(e) => setMontoRecibido(e.target.value)} placeholder={cuadre.montoEsperadoAjustado.toString()} />
            </div>
            <Button onClick={handleConfirmar} disabled={confirmar.isPending || !montoRecibido}>
              {confirmar.isPending ? 'Confirmando...' : 'Confirmar'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
