'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { EstadoBadge } from '@/components/shared/estado-badge';
import { useLote, useResumenFinanciero } from '@/lib/hooks/use-lotes';
import { formatCOP, formatDate } from '@/lib/utils/format';

export default function LoteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: lote, isLoading } = useLote(id);
  const { data: resumen } = useResumenFinanciero(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!lote) {
    return <p className="text-muted-foreground">Lote no encontrado</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/mis-lotes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Lote — {lote.cantidadTrabix} TRABIX</h1>
      </div>

      {/* Info general */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Estado</span>
            <EstadoBadge estado={lote.estado} />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Modelo</span>
            <span className="font-medium">
              {lote.modeloNegocio.replace('MODELO_', '').replace('_', '/')}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Creado</span>
            <span>{formatDate(lote.fechaCreacion)}</span>
          </div>
          {lote.fechaActivacion && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Activado</span>
              <span>{formatDate(lote.fechaActivacion)}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inversión y recaudo */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Resumen Financiero</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Tu inversión</p>
              <p className="font-semibold">{formatCOP(resumen?.inversionVendedor ?? lote.inversionVendedor)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Recaudado</p>
              <p className="font-semibold">{formatCOP(resumen?.dineroRecaudado ?? lote.dineroRecaudado)}</p>
            </div>
            {resumen && (
              <>
                <div>
                  <p className="text-muted-foreground">Tu ganancia</p>
                  <p className="font-semibold text-green-600">
                    {formatCOP(resumen.gananciaVendedor)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Stock disponible</p>
                  <p className="font-semibold">{resumen.stockTotalDisponible}</p>
                </div>
              </>
            )}
          </div>
          <Separator />
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Recaudo</span>
              <span>{(resumen?.porcentajeRecaudo ?? lote.porcentajeRecaudo).toFixed(0)}%</span>
            </div>
            <Progress
              value={resumen?.porcentajeRecaudo ?? lote.porcentajeRecaudo}
              className="h-2"
            />
          </div>
          {resumen && (
            <div className="text-xs text-muted-foreground">
              Regalos: {resumen.regalosUtilizados} / {resumen.maximoRegalos}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tandas */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Tandas ({lote.tandas.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {lote.tandas.map((tanda) => (
            <div key={tanda.id} className="rounded-md border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tanda {tanda.numero}</span>
                <EstadoBadge estado={tanda.estado} />
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Stock: {tanda.stockActual} / {tanda.stockInicial}</span>
                <span>{tanda.porcentajeStockRestante.toFixed(0)}%</span>
              </div>
              <Progress value={tanda.porcentajeStockRestante} className="h-1.5" />
            </div>
          ))}
          <div className="flex gap-2 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p>Para las tandas EN TRÁNSITO se gestiona el reparto y admin contactará contigo</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
