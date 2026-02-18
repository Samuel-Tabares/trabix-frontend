'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { EstadoBadge } from '@/components/shared/estado-badge';
import { useCuadre } from '@/lib/hooks/use-cuadres';
import { formatCOP, formatDateTime } from '@/lib/utils/format';

export default function CuadreDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: cuadre, isLoading } = useCuadre(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!cuadre) {
    return <p className="text-muted-foreground">Cuadre no encontrado</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/mis-cuadres">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Detalle de Cuadre</h1>
      </div>

      {/* Estado y concepto */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Estado</span>
            <EstadoBadge estado={cuadre.estado} />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Concepto</span>
            <span className="font-medium">{cuadre.concepto.replace(/_/g, ' ')}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Tanda</span>
            <span className="font-medium">#{cuadre.tanda.numero}</span>
          </div>
          {cuadre.fueCerradoPorMayor && (
            <div className="rounded-md bg-blue-50 p-2 text-xs text-blue-700">
              Cerrado por cuadre mayor
            </div>
          )}
        </CardContent>
      </Card>

      {/* Montos */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Montos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Monto esperado</span>
            <span className="font-medium">{formatCOP(cuadre.montoEsperado)}</span>
          </div>
          {cuadre.montoEsperadoAjustado !== cuadre.montoEsperado && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Monto ajustado</span>
              <span className="font-medium">{formatCOP(cuadre.montoEsperadoAjustado)}</span>
            </div>
          )}
          <Separator />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Monto recibido</span>
            <span className="font-medium">{formatCOP(cuadre.montoRecibido)}</span>
          </div>
          {cuadre.montoFaltante > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Monto faltante</span>
              <span className="font-medium text-red-600">{formatCOP(cuadre.montoFaltante)}</span>
            </div>
          )}
          {cuadre.montoCubiertoPorMayor > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Cubierto por mayor</span>
              <span className="font-medium">{formatCOP(cuadre.montoCubiertoPorMayor)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fechas */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Fechas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {cuadre.fechaPendiente && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Fecha pendiente</span>
              <span>{formatDateTime(cuadre.fechaPendiente)}</span>
            </div>
          )}
          {cuadre.fechaExitoso && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Fecha exitoso</span>
              <span>{formatDateTime(cuadre.fechaExitoso)}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
