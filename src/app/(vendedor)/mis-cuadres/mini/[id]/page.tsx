'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EstadoBadge } from '@/components/shared/estado-badge';
import { useMiniCuadre } from '@/lib/hooks/use-mini-cuadres';
import { formatCOP, formatDate } from '@/lib/utils/format';

export default function MiniCuadreDetalleVendedorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: mc, isLoading } = useMiniCuadre(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!mc) {
    return <p className="text-muted-foreground">Mini-cuadre no encontrado</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/mis-cuadres">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Cierre de Lote</h1>
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Estado</span>
            <EstadoBadge estado={mc.estado} />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Concepto</span>
            <span className="font-medium">Cierre de Lote</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Montos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Monto a transferir</span>
            <span className="font-semibold">{formatCOP(mc.montoFinal)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Fechas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {mc.fechaPendiente && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Fecha pendiente</span>
              <span>{formatDate(mc.fechaPendiente)}</span>
            </div>
          )}
          {mc.fechaExitoso && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Fecha confirmado</span>
              <span>{formatDate(mc.fechaExitoso)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {mc.estado === 'PENDIENTE' && (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardContent className="p-4 text-sm text-yellow-800">
            El admin está procesando tu cuadre de cierre. Pronto recibirás confirmación.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
