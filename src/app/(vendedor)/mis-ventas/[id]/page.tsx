'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useVenta } from '@/lib/hooks/use-ventas';
import { formatCOP, formatDateTime } from '@/lib/utils/format';

export default function VentaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: venta, isLoading } = useVenta(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!venta) {
    return <p className="text-muted-foreground">Venta no encontrada</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/mis-ventas">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Detalle de Venta</h1>
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">{formatCOP(venta.montoTotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total TRABIX</span>
            <span className="font-medium">{venta.cantidadTrabix}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Regalos</span>
            <span>{venta.cantidadRegalos}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Fecha</span>
            <span>{formatDateTime(venta.fechaRegistro)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Detalles por tipo */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Detalles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {venta.detalles.map((detalle) => (
            <div key={detalle.id}>
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">
                    {detalle.tipo.replace('_', ' ')}
                  </span>
                  <span className="text-muted-foreground ml-2">
                    x{detalle.cantidad}
                  </span>
                </div>
                <span className="font-medium">{formatCOP(detalle.subtotal)}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {formatCOP(detalle.precioUnitario)} c/u — {detalle.trabixConsumidos} TRABIX
              </div>
              <Separator className="mt-2" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
