'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { EstadoBadge } from '@/components/shared/estado-badge';
import { useMiniCuadre, useConfirmarMiniCuadre } from '@/lib/hooks/use-mini-cuadres';
import { formatCOP, formatDate } from '@/lib/utils/format';
import { toast } from 'sonner';

export default function MiniCuadreDetalleAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: mc, isLoading } = useMiniCuadre(id);
  const confirmar = useConfirmarMiniCuadre();

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-60 w-full" /></div>;
  if (!mc) return <p className="text-muted-foreground">Mini-cuadre no encontrado</p>;

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center gap-2">
        <Link href="/cuadres"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="text-2xl font-bold">Mini Cuadre</h1>
        <EstadoBadge estado={mc.estado} />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Información</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-muted-foreground">Concepto</p><p className="font-medium">Cierre de Lote</p></div>
          <div><p className="text-muted-foreground">Monto Final</p><p className="font-semibold">{formatCOP(mc.montoFinal)}</p></div>
          {mc.fechaPendiente && <div><p className="text-muted-foreground">Activado</p><p>{formatDate(mc.fechaPendiente)}</p></div>}
          {mc.fechaExitoso && <div><p className="text-muted-foreground">Confirmado</p><p>{formatDate(mc.fechaExitoso)}</p></div>}
        </CardContent>
      </Card>

      {mc.estado === 'EXITOSO' && (
        <Card>
          <CardHeader><CardTitle className="text-base">Registro de Pago</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Monto confirmado</span>
              <span className="font-semibold text-green-700">{formatCOP(mc.montoFinal)}</span>
            </div>
            {mc.fechaExitoso && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Fecha de confirmación</span>
                <span className="font-medium">{formatDate(mc.fechaExitoso)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {mc.estado === 'PENDIENTE' && (
        <Card>
          <CardHeader><CardTitle className="text-base">Confirmar Mini-Cuadre</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Separator />
            <p className="text-sm text-muted-foreground">
              El vendedor debe transferir el monto final del lote. Al confirmar, la tanda y el lote quedan finalizados.
            </p>
            <div className="flex items-center justify-between font-semibold text-sm">
              <span>Total a confirmar</span>
              <span>{formatCOP(mc.montoFinal)}</span>
            </div>
            <Button
              size="sm"
              onClick={() =>
                confirmar.mutate(mc.id, {
                  onSuccess: () => toast.success('Mini-cuadre confirmado. Lote finalizado.'),
                  onError: () => toast.error('Error al confirmar mini-cuadre'),
                })
              }
              disabled={confirmar.isPending}
            >
              {confirmar.isPending ? 'Confirmando...' : 'Confirmar'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
