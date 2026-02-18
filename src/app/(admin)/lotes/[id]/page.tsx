'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { EstadoBadge } from '@/components/shared/estado-badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useLote, useResumenFinanciero, useActivarLote, useCancelarLote } from '@/lib/hooks/use-lotes';
import { useConfirmarEntregaTanda } from '@/lib/hooks/use-tandas';
import { formatCOP, formatDate } from '@/lib/utils/format';
import { toast } from 'sonner';

export default function LoteDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: lote, isLoading } = useLote(id);
  const { data: resumen } = useResumenFinanciero(id);
  const activar = useActivarLote();
  const cancelar = useCancelarLote();
  const confirmarEntrega = useConfirmarEntregaTanda();

  const [confirmAction, setConfirmAction] = useState<'activar' | 'cancelar' | null>(null);
  const [confirmTandaId, setConfirmTandaId] = useState<string | null>(null);

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-60 w-full" /></div>;
  if (!lote) return <p className="text-muted-foreground">Lote no encontrado</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/lotes"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="text-2xl font-bold">Lote — {lote.cantidadTrabix} TRABIX</h1>
        <EstadoBadge estado={lote.estado} />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Información General</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-muted-foreground">Modelo</p><p className="font-medium">{lote.modeloNegocio.replace('MODELO_', '').replace('_', '/')}</p></div>
          <div><p className="text-muted-foreground">Lote Forzado</p><p className="font-medium">{lote.esLoteForzado ? 'Sí' : 'No'}</p></div>
          <div><p className="text-muted-foreground">Creado</p><p>{formatDate(lote.fechaCreacion)}</p></div>
          {lote.fechaActivacion && <div><p className="text-muted-foreground">Activado</p><p>{formatDate(lote.fechaActivacion)}</p></div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Resumen Financiero</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-muted-foreground">Inversión Total</p><p className="font-semibold">{formatCOP(resumen?.inversionTotal ?? lote.inversionTotal)}</p></div>
            <div><p className="text-muted-foreground">Inversión Admin</p><p className="font-semibold">{formatCOP(resumen?.inversionAdmin ?? lote.inversionAdmin)}</p></div>
            <div><p className="text-muted-foreground">Inversión Vendedor</p><p className="font-semibold">{formatCOP(resumen?.inversionVendedor ?? lote.inversionVendedor)}</p></div>
            <div><p className="text-muted-foreground">Recaudado</p><p className="font-semibold">{formatCOP(resumen?.dineroRecaudado ?? lote.dineroRecaudado)}</p></div>
            {resumen && <>
              <div><p className="text-muted-foreground">Ganancia Admin</p><p className="font-semibold text-green-600">{formatCOP(resumen.gananciaAdmin)}</p></div>
              <div><p className="text-muted-foreground">Ganancia Vendedor</p><p className="font-semibold text-green-600">{formatCOP(resumen.gananciaVendedor)}</p></div>
            </>}
          </div>
          <Separator />
          <div className="space-y-1">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Recaudo</span><span>{(resumen?.porcentajeRecaudo ?? lote.porcentajeRecaudo).toFixed(0)}%</span></div>
            <Progress value={resumen?.porcentajeRecaudo ?? lote.porcentajeRecaudo} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Tandas ({lote.tandas.length})</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {lote.tandas.map((tanda) => (
            <div key={tanda.id} className="rounded-md border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tanda {tanda.numero}</span>
                <div className="flex items-center gap-2">
                  <EstadoBadge estado={tanda.estado} />
                  {tanda.estado === 'EN_TRANSITO' && (
                    <Button size="sm" variant="outline" onClick={() => setConfirmTandaId(tanda.id)}>
                      Confirmar Entrega
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Stock: {tanda.stockActual} / {tanda.stockInicial}</span>
                <span>{tanda.porcentajeStockRestante.toFixed(0)}%</span>
              </div>
              <Progress value={tanda.porcentajeStockRestante} className="h-1.5" />
            </div>
          ))}
        </CardContent>
      </Card>

      {lote.estado === 'CREADO' && (
        <div className="flex gap-2">
          <Button onClick={() => setConfirmAction('activar')}>Activar Lote</Button>
          <Button variant="destructive" onClick={() => setConfirmAction('cancelar')}>Cancelar Lote</Button>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(open) => { if (!open) setConfirmAction(null); }}
        title={confirmAction === 'activar' ? 'Activar Lote' : 'Cancelar Lote'}
        description={confirmAction === 'activar' ? '¿Activar este lote?' : '¿Cancelar este lote?'}
        variant={confirmAction === 'cancelar' ? 'destructive' : 'default'}
        onConfirm={() => {
          const m = confirmAction === 'activar' ? activar : cancelar;
          m.mutate(id, {
            onSuccess: () => { toast.success(confirmAction === 'activar' ? 'Lote activado' : 'Lote cancelado'); setConfirmAction(null); },
            onError: () => toast.error('Error'),
          });
        }}
        isLoading={activar.isPending || cancelar.isPending}
      />

      <ConfirmDialog
        open={!!confirmTandaId}
        onOpenChange={(open) => { if (!open) setConfirmTandaId(null); }}
        title="Confirmar Entrega"
        description="¿Confirmar que la tanda fue entregada al vendedor?"
        onConfirm={() => {
          if (!confirmTandaId) return;
          confirmarEntrega.mutate(confirmTandaId, {
            onSuccess: () => { toast.success('Entrega confirmada'); setConfirmTandaId(null); },
            onError: () => toast.error('Error al confirmar entrega'),
          });
        }}
        isLoading={confirmarEntrega.isPending}
      />
    </div>
  );
}
