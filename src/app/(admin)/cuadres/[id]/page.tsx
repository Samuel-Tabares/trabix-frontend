'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { EstadoBadge } from '@/components/shared/estado-badge';
import { useCuadre, useConfirmarCuadre } from '@/lib/hooks/use-cuadres';
import { useLote, useLotes } from '@/lib/hooks/use-lotes';
import { formatCOP, formatDate } from '@/lib/utils/format';
import { useMemo } from 'react';
import { toast } from 'sonner';

export default function CuadreDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: cuadre, isLoading } = useCuadre(id);
  const confirmar = useConfirmarCuadre();

  const loteId = cuadre?.tanda.loteId ?? '';
  const { data: lote } = useLote(loteId);
  const { data: lotesVendedor } = useLotes(
    { vendedorId: lote?.vendedorId, take: 500, orderBy: 'fechaCreacion', orderDirection: 'asc' },
    !!lote?.vendedorId,
  );

  const loteNumero = useMemo(() => {
    if (!loteId || !lotesVendedor?.data) return null;
    const sorted = [...lotesVendedor.data].sort(
      (a, b) => new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime(),
    );
    const idx = sorted.findIndex((l) => l.id === loteId);
    return idx >= 0 ? idx + 1 : null;
  }, [loteId, lotesVendedor]);
  const [montoRecibido, setMontoRecibido] = useState('');
  const [montoError, setMontoError] = useState('');

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-60 w-full" /></div>;
  if (!cuadre) return <p className="text-muted-foreground">Cuadre no encontrado</p>;

  const validateMonto = (value: string) => {
    const n = Number(value);
    if (!value) return '';
    if (n <= 0) return 'El monto debe ser mayor a 0';
    if (n > cuadre.montoFaltante) return `No puede superar el monto pendiente (${formatCOP(cuadre.montoFaltante)})`;
    return '';
  };

  const handleConfirmar = () => {
    const error = validateMonto(montoRecibido);
    if (error) { setMontoError(error); return; }
    const monto = Number(montoRecibido);
    confirmar.mutate(
      { id, montoRecibido: monto },
      {
        onSuccess: (data: any) => {
          const estaCompleto = data?.estado === 'EXITOSO';
          if (estaCompleto) {
            toast.success('Cuadre confirmado exitosamente', { description: `Pago total: ${formatCOP(data.montoRecibido ?? monto)}` });
          } else {
            toast.success('Abono registrado', { description: `Se abonaron ${formatCOP(monto)} — falta ${formatCOP((cuadre.montoFaltante - monto))}` });
          }
          setMontoRecibido('');
          setMontoError('');
        },
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
          <div><p className="text-muted-foreground">Tanda</p><p className="font-medium">#{cuadre.tanda.numero} de {lote?.numeroTandas ?? '…'}</p></div>
          {loteNumero != null && (
            <div><p className="text-muted-foreground">Lote</p><p className="font-medium">#{loteNumero} ({lote?.cantidadTrabix} TRABIX)</p></div>
          )}
          {lote?.vendedor && (
            <div><p className="text-muted-foreground">Vendedor</p><p className="font-medium">{lote.vendedor.nombre} {lote.vendedor.apellidos}</p></div>
          )}
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

      {cuadre.desglose && (
        <Card>
          <CardHeader><CardTitle className="text-base">Desglose del cobro</CardTitle></CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            {cuadre.desglose.inversionAdmin > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Inversión admin</span>
                <span className="font-medium">{formatCOP(cuadre.desglose.inversionAdmin)}</span>
              </div>
            )}
            {cuadre.desglose.gananciasAdmin > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Ganancias admin</span>
                <span className="font-medium">{formatCOP(cuadre.desglose.gananciasAdmin)}</span>
              </div>
            )}
            {cuadre.desglose.mensualidades > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Mensualidades equipamiento</span>
                <span className="font-medium text-amber-700">{formatCOP(cuadre.desglose.mensualidades)}</span>
              </div>
            )}
            {cuadre.desglose.deudaDano > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Deuda por daño</span>
                <span className="font-medium text-red-600">{formatCOP(cuadre.desglose.deudaDano)}</span>
              </div>
            )}
            {cuadre.desglose.deudaPerdida > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Deuda por pérdida</span>
                <span className="font-medium text-red-600">{formatCOP(cuadre.desglose.deudaPerdida)}</span>
              </div>
            )}
            <Separator />
            <div className="flex items-center justify-between font-semibold">
              <span>Total esperado</span>
              <span>{formatCOP(cuadre.montoEsperado)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {cuadre.estado === 'EXITOSO' && cuadre.fechaExitoso && (
        <Card>
          <CardHeader><CardTitle className="text-base">Registro de Pago</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Monto confirmado</span>
              <span className="font-semibold text-green-700">{formatCOP(cuadre.montoRecibido)}</span>
            </div>
            {cuadre.montoFaltante > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Monto faltante</span>
                <span className="font-semibold text-red-600">{formatCOP(cuadre.montoFaltante)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Fecha de confirmación</span>
              <span className="font-medium">{formatDate(cuadre.fechaExitoso)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {cuadre.estado === 'PENDIENTE' && (
        <Card>
          <CardHeader><CardTitle className="text-base">Confirmar Cuadre</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Separator />
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Monto recibido del vendedor</p>
              <div className="flex items-end gap-2">
                <div className="space-y-1 flex-1">
                  <Label className="text-xs">Monto (máx. {formatCOP(cuadre.montoFaltante)})</Label>
                  <Input
                    type="number"
                    step="1000"
                    min="1"
                    max={cuadre.montoFaltante}
                    value={montoRecibido}
                    onChange={(e) => { setMontoRecibido(e.target.value); setMontoError(validateMonto(e.target.value)); }}
                    placeholder="0"
                  />
                  {montoError && <p className="text-xs text-red-500">{montoError}</p>}
                </div>
                <Button size="sm" onClick={handleConfirmar} disabled={confirmar.isPending || !montoRecibido || !!montoError}>
                  {confirmar.isPending ? 'Confirmando...' : 'Confirmar'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
