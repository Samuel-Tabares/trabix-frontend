'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCrearPedido } from '@/lib/hooks/use-pedidos-stock';
import { useTiposInsumo } from '@/lib/hooks/use-configuraciones';
import { pedidosStockApi } from '@/lib/api/pedidos-stock.api';
import { getApiError } from '@/lib/utils/errors';
import { toast } from 'sonner';
import type { TipoInsumo } from '@/types/configuracion.types';

type InsumoState = { cantidad: string; costoTotal: string };

export default function CrearPedidoStockPage() {
  const router = useRouter();
  const crear = useCrearPedido();
  const { data: tipos, isLoading: loadingTipos } = useTiposInsumo();

  const [cantidadTrabix, setCantidadTrabix] = useState('');
  const [notas, setNotas] = useState('');
  const [insumos, setInsumos] = useState<Record<string, InsumoState>>({});
  const [submitting, setSubmitting] = useState(false);

  const setInsumo = (tipoId: string, field: keyof InsumoState, value: string) => {
    setInsumos((prev) => ({
      ...prev,
      [tipoId]: { ...prev[tipoId], [field]: value },
    }));
  };

  const getInsumo = (tipoId: string): InsumoState =>
    insumos[tipoId] ?? { cantidad: '', costoTotal: '' };

  const cantidadNum = Number(cantidadTrabix);

  const calcularAporte = (tipoId: string): string => {
    const { costoTotal } = getInsumo(tipoId);
    const costo = Number(costoTotal);
    if (!costo || !cantidadNum) return '—';
    return `$${(costo / cantidadNum).toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cantidadNum || cantidadNum < 1) return;
    setSubmitting(true);

    try {
      // 1. Crear pedido
      const pedido = await pedidosStockApi.crear({
        cantidadTrabix: cantidadNum,
        notas: notas || undefined,
      });

      // 2. Agregar costos de insumos con costoTotal > 0
      const costos = (tipos ?? []).map((tipo: TipoInsumo) => {
        const { cantidad, costoTotal } = getInsumo(tipo.id);
        const montoTotal = Number(costoTotal);
        const cantidadUnidades = Number(cantidad);
        return { tipo, montoTotal, cantidadUnidades };
      }).filter(({ montoTotal }) => montoTotal > 0);

      for (const { tipo, montoTotal, cantidadUnidades } of costos) {
        await pedidosStockApi.agregarCosto(pedido.id, {
          concepto: tipo.nombre,
          costoTotal: montoTotal,
          cantidad: cantidadUnidades > 0 ? cantidadUnidades : undefined,
          esObligatorio: tipo.esObligatorio,
        });
      }

      crear.reset();
      toast.success('Pedido creado con insumos');
      router.push(`/stock/pedidos/${pedido.id}`);
    } catch (err) {
      toast.error(getApiError(err, 'Error al crear pedido'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center gap-2">
        <Link href="/stock"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="text-2xl font-bold">Nuevo Pedido de Stock</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Datos del Pedido</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Cantidad de Trabix</Label>
              <Input
                type="number"
                min={1}
                className="no-spinner"
                value={cantidadTrabix}
                onChange={(e) => setCantidadTrabix(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Notas (opcional)</Label>
              <Textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Notas adicionales..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Insumos</CardTitle>
            {cantidadNum > 0 && (
              <p className="text-xs text-muted-foreground">
                Aporte/trabix = costo total del insumo ÷ {cantidadNum} trabix
              </p>
            )}
          </CardHeader>
          <CardContent>
            {loadingTipos ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : !tipos || tipos.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay tipos de insumo configurados.{' '}
                <Link href="/stock/tipos-insumo" className="text-primary underline">
                  Configura tipos de insumo
                </Link>
              </p>
            ) : (
              <div className="space-y-1">
                <div className="grid grid-cols-[1fr_100px_110px_80px] gap-2 px-2 pb-1">
                  <span className="text-xs text-muted-foreground">Insumo</span>
                  <span className="text-xs text-muted-foreground text-right">Cantidad uds</span>
                  <span className="text-xs text-muted-foreground text-right">Costo total</span>
                  <span className="text-xs text-muted-foreground text-right">Aporte/ud</span>
                </div>
                {tipos.map((tipo) => (
                  <div key={tipo.id} className="grid grid-cols-[1fr_100px_110px_80px] gap-2 items-center rounded-md border px-2 py-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-sm font-medium truncate">{tipo.nombre}</span>
                      {tipo.esObligatorio && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded shrink-0">Oblig.</span>
                      )}
                    </div>
                    <Input
                      type="number"
                      min={0}
                      className="no-spinner h-8 text-sm text-right"
                      placeholder="0"
                      value={getInsumo(tipo.id).cantidad}
                      onChange={(e) => setInsumo(tipo.id, 'cantidad', e.target.value)}
                    />
                    <Input
                      type="number"
                      min={0}
                      className="no-spinner h-8 text-sm text-right"
                      placeholder="$0"
                      value={getInsumo(tipo.id).costoTotal}
                      onChange={(e) => setInsumo(tipo.id, 'costoTotal', e.target.value)}
                    />
                    <p className="text-sm text-right font-medium tabular-nums">
                      {calcularAporte(tipo.id)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Button type="submit" disabled={submitting || !cantidadTrabix}>
          {submitting ? 'Creando...' : 'Crear Pedido'}
        </Button>
      </form>
    </div>
  );
}
