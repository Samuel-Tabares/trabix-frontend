'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, XCircle, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { EstadoBadge } from '@/components/shared/estado-badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import {
  useEquipamiento, useActivarEquipamiento, useReportarDano, useReportarPerdida,
  useDevolverEquipamiento, usePagarMensualidad, usePagarDeudaDano, usePagarDeudaPerdida,
  useDevolverDeposito,
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
  const pagarDeudaDano = usePagarDeudaDano();
  const pagarDeudaPerdida = usePagarDeudaPerdida();
  const devolverDeposito = useDevolverDeposito();

  const [action, setAction] = useState<ActionType>(null);
  const [montoDano, setMontoDano] = useState('');
  const [montoPerdida, setMontoPerdida] = useState('');
  const [montoDanoError, setMontoDanoError] = useState('');
  const [montoPerdidaError, setMontoPerdidaError] = useState('');

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-60 w-full" /></div>;
  if (!equipo) return <p className="text-muted-foreground">Equipamiento no encontrado</p>;

  const validateMontoDano = (value: string) => {
    const n = Number(value);
    if (!value) return '';
    if (n <= 0) return 'El monto debe ser mayor a 0';
    if (n > equipo.deudaDano) return `No puede superar la deuda actual (${formatCOP(equipo.deudaDano)})`;
    return '';
  };

  const validateMontoPerdida = (value: string) => {
    const n = Number(value);
    if (!value) return '';
    if (n <= 0) return 'El monto debe ser mayor a 0';
    if (n > equipo.deudaPerdida) return `No puede superar la deuda actual (${formatCOP(equipo.deudaPerdida)})`;
    return '';
  };

  const handleAction = () => {
    const onSuccess = (msg: string) => () => { toast.success(msg); setAction(null); };
    const onError = () => toast.error('Error al ejecutar acción');

    switch (action) {
      case 'activar': activar.mutate(id, { onSuccess: onSuccess('Equipamiento activado'), onError }); break;
      case 'dano-nevera': reportarDano.mutate({ id, data: { tipoDano: 'NEVERA' } }, { onSuccess: onSuccess('Daño de nevera reportado'), onError }); break;
      case 'dano-pijama': reportarDano.mutate({ id, data: { tipoDano: 'PIJAMA' } }, { onSuccess: onSuccess('Daño de pijama reportado'), onError }); break;
      case 'perdida': reportarPerdida.mutate(id, { onSuccess: onSuccess('Pérdida reportada'), onError }); break;
      case 'devolver': devolver.mutate(id, { onSuccess: onSuccess('Equipamiento devuelto'), onError }); break;
      case 'mensualidad': pagarMensualidad.mutate(id, { onSuccess: onSuccess('Mensualidad pagada'), onError }); break;
      case 'deposito': devolverDeposito.mutate(id, { onSuccess: onSuccess('Depósito devuelto'), onError }); break;
    }
  };

  const handlePagarDeudaDano = () => {
    const error = validateMontoDano(montoDano);
    if (error) { setMontoDanoError(error); return; }
    const monto = Number(montoDano);
    pagarDeudaDano.mutate(
      { id, data: { monto } },
      {
        onSuccess: () => {
          toast.success('Abono registrado', { description: `Se abonaron ${formatCOP(monto)} a la deuda por daño` });
          setMontoDano('');
          setMontoDanoError('');
        },
        onError: () => toast.error('Error al registrar abono'),
      },
    );
  };

  const handlePagarDeudaPerdida = () => {
    const error = validateMontoPerdida(montoPerdida);
    if (error) { setMontoPerdidaError(error); return; }
    const monto = Number(montoPerdida);
    pagarDeudaPerdida.mutate(
      { id, data: { monto } },
      {
        onSuccess: () => {
          toast.success('Abono registrado', { description: `Se abonaron ${formatCOP(monto)} a la deuda por pérdida` });
          setMontoPerdida('');
          setMontoPerdidaError('');
        },
        onError: () => toast.error('Error al registrar abono'),
      },
    );
  };

  const confirmTitles: Record<string, string> = {
    activar: 'Activar Equipamiento',
    devolver: 'Devolver Equipamiento',
    perdida: 'Reportar Pérdida Total',
    deposito: 'Devolver Depósito',
    'dano-nevera': 'Reportar Daño — Nevera',
    'dano-pijama': 'Reportar Daño — Pijama',
    mensualidad: 'Pagar Mensualidad',
  };
  const confirmTitle = (action ? confirmTitles[action] : null) ?? 'Confirmar acción';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/equipamiento"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="text-2xl font-bold">Equipamiento</h1>
        <EstadoBadge estado={equipo.estado} />
      </div>

      {/* Info general */}
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

      {/* Estado de componentes */}
      <Card>
        <CardHeader><CardTitle className="text-base">Componentes</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            {equipo.neveraDanada
              ? <XCircle className="h-4 w-4 text-red-500 shrink-0" />
              : <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />}
            <div>
              <p className="text-sm font-medium">Nevera</p>
              <Badge variant={equipo.neveraDanada ? 'destructive' : 'secondary'} className="text-xs">
                {equipo.neveraDanada ? 'Dañada' : 'OK'}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {equipo.pijamaDanada
              ? <XCircle className="h-4 w-4 text-red-500 shrink-0" />
              : <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />}
            <div>
              <p className="text-sm font-medium">Pijama</p>
              <Badge variant={equipo.pijamaDanada ? 'destructive' : 'secondary'} className="text-xs">
                {equipo.pijamaDanada ? 'Dañada' : 'OK'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deudas */}
      {equipo.tieneDeuda && (
        <Card>
          <CardHeader><CardTitle className="text-base">Deudas</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-muted-foreground">Deuda Daño</p><p className="font-semibold text-red-600">{formatCOP(equipo.deudaDano)}</p></div>
              <div><p className="text-muted-foreground">Deuda Pérdida</p><p className="font-semibold text-red-600">{formatCOP(equipo.deudaPerdida)}</p></div>
              <div><p className="text-muted-foreground">Total s/mensualidades</p><p className="font-bold text-red-600">{formatCOP(equipo.deudaTotal)}</p></div>
              <div><p className="text-muted-foreground">Total c/mensualidades</p><p className="font-bold">{formatCOP(equipo.deudaTotalConMensualidades)}</p></div>
            </div>

            {equipo.deudaDano > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Abonar a deuda por daño</p>
                  <div className="flex items-end gap-2">
                    <div className="space-y-1 flex-1">
                      <Label className="text-xs">Monto (máx. {formatCOP(equipo.deudaDano)})</Label>
                      <Input
                        type="number"
                        step="1000"
                        min="1"
                        max={equipo.deudaDano}
                        value={montoDano}
                        onChange={(e) => { setMontoDano(e.target.value); setMontoDanoError(validateMontoDano(e.target.value)); }}
                        placeholder="0"
                      />
                      {montoDanoError && <p className="text-xs text-red-500">{montoDanoError}</p>}
                    </div>
                    <Button size="sm" onClick={handlePagarDeudaDano} disabled={pagarDeudaDano.isPending || !montoDano || !!montoDanoError}>
                      Abonar
                    </Button>
                  </div>
                </div>
              </>
            )}

            {equipo.deudaPerdida > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Abonar a deuda por pérdida</p>
                  <div className="flex items-end gap-2">
                    <div className="space-y-1 flex-1">
                      <Label className="text-xs">Monto (máx. {formatCOP(equipo.deudaPerdida)})</Label>
                      <Input
                        type="number"
                        step="1000"
                        min="1"
                        max={equipo.deudaPerdida}
                        value={montoPerdida}
                        onChange={(e) => { setMontoPerdida(e.target.value); setMontoPerdidaError(validateMontoPerdida(e.target.value)); }}
                        placeholder="0"
                      />
                      {montoPerdidaError && <p className="text-xs text-red-500">{montoPerdidaError}</p>}
                    </div>
                    <Button size="sm" onClick={handlePagarDeudaPerdida} disabled={pagarDeudaPerdida.isPending || !montoPerdida || !!montoPerdidaError}>
                      Abonar
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Historial de abonos */}
      {equipo.abonos && equipo.abonos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <History className="h-4 w-4" />
              Historial de Abonos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {equipo.abonos.map((abono) => (
              <div key={abono.id} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                <div>
                  <span className={
                    abono.tipo === 'DANO' ? 'text-orange-600 font-medium'
                    : abono.tipo === 'PERDIDA' ? 'text-red-600 font-medium'
                    : 'text-blue-600 font-medium'
                  }>
                    {abono.tipo === 'DANO' ? 'Daño' : abono.tipo === 'PERDIDA' ? 'Pérdida' : 'Mensualidad'}
                  </span>
                  {abono.cuadreId && (
                    <span className="ml-2 text-xs text-muted-foreground">(vía cuadre)</span>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCOP(abono.monto)}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(abono.fecha)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Acciones */}
      <Separator />
      <div className="flex gap-2 flex-wrap">
        {equipo.estado === 'SOLICITADO' && <Button onClick={() => setAction('activar')}>Activar</Button>}
        {equipo.estado === 'ACTIVO' && (
          <>
            <Button onClick={() => setAction('mensualidad')}>Pagar Mensualidad</Button>
            <Button
              variant="outline"
              onClick={() => setAction('dano-nevera')}
              disabled={equipo.neveraDanada}
              title={equipo.neveraDanada ? 'La nevera ya fue reportada como dañada' : undefined}
            >
              Reportar Daño Nevera
            </Button>
            <Button
              variant="outline"
              onClick={() => setAction('dano-pijama')}
              disabled={equipo.pijamaDanada}
              title={equipo.pijamaDanada ? 'La pijama ya fue reportada como dañada' : undefined}
            >
              Reportar Daño Pijama
            </Button>
            <Button variant="destructive" onClick={() => setAction('perdida')}>Reportar Pérdida</Button>
            <Button variant="outline" onClick={() => setAction('devolver')}>Devolver</Button>
          </>
        )}
        {equipo.tieneDeposito && !equipo.depositoDevuelto && equipo.estado === 'DEVUELTO' && (
          <Button onClick={() => setAction('deposito')}>Devolver Depósito</Button>
        )}
      </div>

      <ConfirmDialog
        open={action !== null && action !== 'mensualidad'}
        onOpenChange={(open) => !open && setAction(null)}
        title={confirmTitle}
        description={
          action === 'dano-nevera' ? `¿Reportar daño en la nevera? Se generará una deuda de $30,000.`
          : action === 'dano-pijama' ? `¿Reportar daño en la pijama? Se generará una deuda de $60,000.`
          : action === 'perdida' ? `¿Reportar pérdida total? Se generará una deuda de $90,000 y el estado cambiará a PERDIDO.`
          : '¿Confirmar esta acción?'
        }
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
