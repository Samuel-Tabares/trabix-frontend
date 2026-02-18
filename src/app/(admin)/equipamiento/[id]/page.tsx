'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { EstadoBadge } from '@/components/shared/estado-badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import {
  useEquipamiento, useActivarEquipamiento, useReportarDano, useReportarPerdida,
  useDevolverEquipamiento, usePagarMensualidad, usePagarDeuda, useDevolverDeposito,
} from '@/lib/hooks/use-equipamiento';
import { formatCOP, formatDate } from '@/lib/utils/format';
import { toast } from 'sonner';

type ActionType = 'activar' | 'dano-nevera' | 'dano-pijama' | 'perdida' | 'devolver' | 'mensualidad' | 'deposito' | null;

export default function EquipamientoDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: equipo, isLoading } = useEquipamiento(id);
  const activar = useActivarEquipamiento();
  const reportarDano = useReportarDano();
  const reportarPerdida = useReportarPerdida();
  const devolver = useDevolverEquipamiento();
  const pagarMensualidad = usePagarMensualidad();
  const pagarDeuda = usePagarDeuda();
  const devolverDeposito = useDevolverDeposito();

  const [action, setAction] = useState<ActionType>(null);
  const [montoDeuda, setMontoDeuda] = useState('');

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-60 w-full" /></div>;
  if (!equipo) return <p className="text-muted-foreground">Equipamiento no encontrado</p>;

  const handleAction = () => {
    const onSuccess = (msg: string) => () => { toast.success(msg); setAction(null); };
    const onError = () => toast.error('Error al ejecutar acción');

    switch (action) {
      case 'activar': activar.mutate(id, { onSuccess: onSuccess('Equipamiento activado'), onError }); break;
      case 'dano-nevera': reportarDano.mutate({ id, data: { tipoDano: 'NEVERA' } }, { onSuccess: onSuccess('Daño reportado'), onError }); break;
      case 'dano-pijama': reportarDano.mutate({ id, data: { tipoDano: 'PIJAMA' } }, { onSuccess: onSuccess('Daño reportado'), onError }); break;
      case 'perdida': reportarPerdida.mutate(id, { onSuccess: onSuccess('Pérdida reportada'), onError }); break;
      case 'devolver': devolver.mutate(id, { onSuccess: onSuccess('Equipamiento devuelto'), onError }); break;
      case 'mensualidad': pagarMensualidad.mutate(id, { onSuccess: onSuccess('Mensualidad pagada'), onError }); break;
      case 'deposito': devolverDeposito.mutate(id, { onSuccess: onSuccess('Depósito devuelto'), onError }); break;
    }
  };

  const handlePagarDeuda = () => {
    pagarDeuda.mutate(
      { id, data: { monto: Number(montoDeuda) } },
      {
        onSuccess: () => { toast.success('Deuda pagada'); setMontoDeuda(''); },
        onError: () => toast.error('Error al pagar deuda'),
      },
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/equipamiento"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="text-2xl font-bold">Equipamiento</h1>
        <EstadoBadge estado={equipo.estado} />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Información</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-muted-foreground">Vendedor</p><p className="font-medium">{equipo.vendedor ? `${equipo.vendedor.nombre} ${equipo.vendedor.apellidos}` : equipo.vendedorId.slice(0, 8)}</p></div>
          <div><p className="text-muted-foreground">Depósito</p><p>{equipo.tieneDeposito ? `Sí — ${formatCOP(equipo.depositoPagado ?? 0)}` : 'No'}</p></div>
          <div><p className="text-muted-foreground">Mensualidad</p><p>{formatCOP(equipo.mensualidadActual)}</p></div>
          <div><p className="text-muted-foreground">Al Día</p><p className={equipo.mensualidadAlDia ? 'text-green-600' : 'text-red-600'}>{equipo.mensualidadAlDia ? 'Sí' : `No (${equipo.diasMoraMensualidad} días mora)`}</p></div>
          <div><p className="text-muted-foreground">Mensualidades Pend.</p><p>{equipo.mensualidadesPendientes} — {formatCOP(equipo.montoMensualidadesPendientes)}</p></div>
          <div><p className="text-muted-foreground">Solicitud</p><p>{formatDate(equipo.fechaSolicitud)}</p></div>
          {equipo.fechaEntrega && <div><p className="text-muted-foreground">Entrega</p><p>{formatDate(equipo.fechaEntrega)}</p></div>}
          {equipo.fechaDevolucion && <div><p className="text-muted-foreground">Devolución</p><p>{formatDate(equipo.fechaDevolucion)}</p></div>}
        </CardContent>
      </Card>

      {equipo.tieneDeuda && (
        <Card>
          <CardHeader><CardTitle className="text-base">Deudas</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-muted-foreground">Deuda Daño</p><p className="font-semibold text-red-600">{formatCOP(equipo.deudaDano)}</p></div>
              <div><p className="text-muted-foreground">Deuda Pérdida</p><p className="font-semibold text-red-600">{formatCOP(equipo.deudaPerdida)}</p></div>
              <div><p className="text-muted-foreground">Deuda Total</p><p className="font-bold text-red-600">{formatCOP(equipo.deudaTotal)}</p></div>
              <div><p className="text-muted-foreground">Con Mensualidades</p><p className="font-bold">{formatCOP(equipo.deudaTotalConMensualidades)}</p></div>
            </div>
            <Separator />
            <div className="flex items-end gap-2">
              <div className="space-y-1 flex-1">
                <Label className="text-xs">Monto a Pagar</Label>
                <Input type="number" step="0.01" value={montoDeuda} onChange={(e) => setMontoDeuda(e.target.value)} placeholder="0" />
              </div>
              <Button size="sm" onClick={handlePagarDeuda} disabled={pagarDeuda.isPending || !montoDeuda}>Pagar Deuda</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />
      <div className="flex gap-2 flex-wrap">
        {equipo.estado === 'SOLICITADO' && <Button onClick={() => setAction('activar')}>Activar</Button>}
        {equipo.estado === 'ACTIVO' && (
          <>
            <Button onClick={() => setAction('mensualidad')}>Pagar Mensualidad</Button>
            <Button variant="outline" onClick={() => setAction('dano-nevera')}>Reportar Daño Nevera</Button>
            <Button variant="outline" onClick={() => setAction('dano-pijama')}>Reportar Daño Pijama</Button>
            <Button variant="destructive" onClick={() => setAction('perdida')}>Reportar Pérdida</Button>
            <Button variant="outline" onClick={() => setAction('devolver')}>Devolver</Button>
          </>
        )}
        {equipo.tieneDeposito && !equipo.depositoDevuelto && equipo.estado === 'DEVUELTO' && (
          <Button onClick={() => setAction('deposito')}>Devolver Depósito</Button>
        )}
      </div>

      <ConfirmDialog
        open={action !== null && action !== 'mensualidad' || false}
        onOpenChange={(open) => !open && setAction(null)}
        title={action === 'activar' ? 'Activar Equipamiento' : action === 'devolver' ? 'Devolver Equipamiento' : action === 'perdida' ? 'Reportar Pérdida' : action === 'deposito' ? 'Devolver Depósito' : 'Reportar Daño'}
        description={`¿Confirmar esta acción?`}
        onConfirm={handleAction}
        isLoading={activar.isPending || reportarDano.isPending || reportarPerdida.isPending || devolver.isPending || devolverDeposito.isPending}
        variant={action === 'perdida' ? 'destructive' : 'default'}
      />
      <ConfirmDialog
        open={action === 'mensualidad'}
        onOpenChange={(open) => !open && setAction(null)}
        title="Pagar Mensualidad"
        description={`¿Registrar pago de mensualidad de ${formatCOP(equipo.mensualidadActual)}?`}
        onConfirm={handleAction}
        isLoading={pagarMensualidad.isPending}
      />
    </div>
  );
}
