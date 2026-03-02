'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { EstadoBadge } from '@/components/shared/estado-badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import {
  usePedidoStock, useAgregarCosto, useEliminarCosto,
  useRecibirPedido, useModificarPedido,
} from '@/lib/hooks/use-pedidos-stock';
import { useTiposInsumo } from '@/lib/hooks/use-configuraciones';
import { formatCOP, formatDate } from '@/lib/utils/format';
import { getApiError } from '@/lib/utils/errors';
import { toast } from 'sonner';
import type { TipoInsumo } from '@/types/configuracion.types';

type InsumoState = { cantidad: string; costoTotal: string };

export default function PedidoStockDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: pedido, isLoading: loadingPedido } = usePedidoStock(id);
  const { data: tipos, isLoading: loadingTipos } = useTiposInsumo();
  const agregarCosto = useAgregarCosto();
  const eliminarCosto = useEliminarCosto();
  const recibir = useRecibirPedido();
  const modificar = useModificarPedido();

  const [insumos, setInsumos] = useState<Record<string, InsumoState>>({});
  const [editingInfo, setEditingInfo] = useState(false);
  const [editCantidad, setEditCantidad] = useState('');
  const [editNotas, setEditNotas] = useState('');
  const [confirmRecibir, setConfirmRecibir] = useState(false);

  // Inicializar inputs desde detallesCosto existentes
  useEffect(() => {
    if (!pedido || !tipos) return;
    const initial: Record<string, InsumoState> = {};
    tipos.forEach((tipo) => {
      const existing = pedido.detallesCosto.find(
        (d) => d.concepto.toLowerCase() === tipo.nombre.toLowerCase(),
      );
      initial[tipo.id] = {
        cantidad: existing?.cantidad ? String(existing.cantidad) : '',
        costoTotal: existing ? String(existing.costoTotal) : '',
      };
    });
    setInsumos(initial);
  }, [pedido?.id, tipos]);

  const isLoading = loadingPedido || loadingTipos;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }
  if (!pedido) return <p className="text-muted-foreground">Pedido no encontrado</p>;

  const isBorrador = pedido.estado === 'BORRADOR';

  const getInsumo = (tipoId: string): InsumoState =>
    insumos[tipoId] ?? { cantidad: '', costoTotal: '' };

  const setInsumoField = (tipoId: string, field: keyof InsumoState, value: string) => {
    setInsumos((prev) => ({ ...prev, [tipoId]: { ...prev[tipoId], [field]: value } }));
  };

  const efectivaCantidad =
    editingInfo && Number(editCantidad) > 0 ? Number(editCantidad) : pedido.cantidadTrabix;

  const calcularAporte = (tipoId: string): string => {
    const costo = Number(getInsumo(tipoId).costoTotal);
    if (!costo || !efectivaCantidad) return '—';
    return `$${(costo / efectivaCantidad).toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;
  };

  const totalCostos = pedido.detallesCosto.reduce((s, d) => s + d.costoTotal, 0);
  const costoPorTrabix = efectivaCantidad > 0 ? totalCostos / efectivaCantidad : 0;

  const handleGuardarCosto = (tipo: TipoInsumo) => {
    const { cantidad, costoTotal } = getInsumo(tipo.id);
    const monto = Number(costoTotal);
    const cantidadUnidades = Number(cantidad);

    const existing = pedido.detallesCosto.find(
      (d) => d.concepto.toLowerCase() === tipo.nombre.toLowerCase(),
    );

    if (monto <= 0 && !tipo.esObligatorio) {
      if (existing) {
        eliminarCosto.mutate(
          { pedidoId: id, costoId: existing.id },
          {
            onSuccess: () => {
              setInsumos((prev) => ({ ...prev, [tipo.id]: { cantidad: '', costoTotal: '' } }));
              toast.success(`${tipo.nombre} removido`);
            },
            onError: (err) => toast.error(getApiError(err, 'Error')),
          },
        );
      }
      return;
    }

    if (tipo.esObligatorio && monto <= 0) {
      toast.error(`${tipo.nombre} es obligatorio — ingresa un monto mayor a $0`);
      return;
    }

    // No hacer nada si el valor es idéntico al guardado
    if (
      existing &&
      monto === existing.costoTotal &&
      cantidadUnidades === (existing.cantidad ?? 0)
    ) {
      return;
    }

    const doAgregar = () => {
      agregarCosto.mutate(
        {
          pedidoId: id,
          data: {
            concepto: tipo.nombre,
            costoTotal: monto,
            cantidad: cantidadUnidades > 0 ? cantidadUnidades : undefined,
            esObligatorio: tipo.esObligatorio,
          },
        },
        {
          onSuccess: () => toast.success(`${tipo.nombre} guardado`),
          onError: (err) => toast.error(getApiError(err, 'Error al guardar')),
        },
      );
    };

    if (existing) {
      eliminarCosto.mutate(
        { pedidoId: id, costoId: existing.id },
        { onSuccess: doAgregar, onError: (err) => toast.error(getApiError(err, 'Error')) },
      );
    } else {
      doAgregar();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, tipo: TipoInsumo) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleGuardarCosto(tipo);
    }
  };

  const handleGuardarInfo = () => {
    modificar.mutate(
      {
        id,
        data: {
          cantidadTrabix: Number(editCantidad) || undefined,
          notas: editNotas || undefined,
        },
      },
      {
        onSuccess: () => { toast.success('Pedido actualizado'); setEditingInfo(false); },
        onError: (err) => toast.error(getApiError(err, 'Error')),
      },
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/stock"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="text-2xl font-bold">Pedido de Stock</h1>
        <EstadoBadge estado={pedido.estado} />
      </div>

      {/* Información del pedido */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Información</CardTitle>
          {isBorrador && !editingInfo && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditCantidad(String(pedido.cantidadTrabix));
                setEditNotas(pedido.notas ?? '');
                setEditingInfo(true);
              }}
            >
              Editar
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {editingInfo ? (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Cantidad de Trabix</Label>
                <Input
                  type="number"
                  min={1}
                  className="no-spinner"
                  value={editCantidad}
                  onChange={(e) => setEditCantidad(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Notas</Label>
                <Textarea value={editNotas} onChange={(e) => setEditNotas(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleGuardarInfo} disabled={modificar.isPending}>Guardar</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingInfo(false)}>Cancelar</Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-muted-foreground">Cantidad</p><p className="font-semibold">{pedido.cantidadTrabix} uds</p></div>
              <div><p className="text-muted-foreground">Costo Total Insumos</p><p className="font-semibold">{formatCOP(totalCostos)}</p></div>
              <div><p className="text-muted-foreground">Costo de producción/Trabix</p><p className="font-semibold">{formatCOP(costoPorTrabix)}</p></div>
              <div><p className="text-muted-foreground">Fecha</p><p>{formatDate(pedido.fechaCreacion)}</p></div>
              {pedido.fechaRecepcion && (
                <div><p className="text-muted-foreground">Recibido</p><p>{formatDate(pedido.fechaRecepcion)}</p></div>
              )}
              {pedido.notas && (
                <div className="col-span-2"><p className="text-muted-foreground">Notas</p><p>{pedido.notas}</p></div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insumos del pedido */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Insumos del Pedido</CardTitle>
          {isBorrador && (
            <p className="text-xs text-muted-foreground">
              Ingresa la cantidad y costo total de cada insumo. Presiona Enter para guardar.
              Aporte/trabix = costo total ÷ {efectivaCantidad} trabix.
            </p>
          )}
        </CardHeader>
        <CardContent>
          {!tipos || tipos.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay tipos de insumo configurados.{' '}
              <Link href="/stock/tipos-insumo" className="text-primary underline">
                Configura tipos de insumo
              </Link>
            </p>
          ) : (
            <div className="space-y-1">
              <div className="grid grid-cols-[1fr_90px_110px_80px_32px] gap-2 px-2 pb-1">
                <span className="text-xs text-muted-foreground">Insumo</span>
                <span className="text-xs text-muted-foreground text-right">Cant. uds</span>
                <span className="text-xs text-muted-foreground text-right">Costo total</span>
                <span className="text-xs text-muted-foreground text-right">Aporte/ud</span>
                <span />
              </div>
              {tipos.map((tipo) => {
                const existing = pedido.detallesCosto.find(
                  (d) => d.concepto.toLowerCase() === tipo.nombre.toLowerCase(),
                );
                return (
                  <div
                    key={tipo.id}
                    className="grid grid-cols-[1fr_90px_110px_80px_32px] gap-2 items-center rounded-md border px-2 py-1.5"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-sm font-medium truncate">{tipo.nombre}</span>
                      {tipo.esObligatorio && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded shrink-0">
                          Oblig.
                        </span>
                      )}
                    </div>

                    {isBorrador ? (
                      <>
                        <Input
                          type="number"
                          min={0}
                          className="no-spinner h-8 text-sm text-right"
                          placeholder="0"
                          value={getInsumo(tipo.id).cantidad}
                          onChange={(e) => setInsumoField(tipo.id, 'cantidad', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, tipo)}
                        />
                        <Input
                          type="number"
                          min={0}
                          className="no-spinner h-8 text-sm text-right"
                          placeholder="$0"
                          value={getInsumo(tipo.id).costoTotal}
                          onChange={(e) => setInsumoField(tipo.id, 'costoTotal', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, tipo)}
                        />
                        <p className="text-sm text-right font-medium tabular-nums">
                          {calcularAporte(tipo.id)}
                        </p>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          disabled={!existing || eliminarCosto.isPending}
                          onClick={() => {
                            if (!existing) return;
                            eliminarCosto.mutate(
                              { pedidoId: id, costoId: existing.id },
                              {
                                onSuccess: () => {
                                  setInsumos((prev) => ({
                                    ...prev,
                                    [tipo.id]: { cantidad: '', costoTotal: '' },
                                  }));
                                  toast.success(`${tipo.nombre} removido`);
                                },
                                onError: () => toast.error('Error al eliminar'),
                              },
                            );
                          }}
                          title="Eliminar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-right text-muted-foreground">
                          {existing?.cantidad ?? '—'}
                        </p>
                        <p className="text-sm text-right font-semibold">
                          {existing ? formatCOP(existing.costoTotal) : '—'}
                        </p>
                        <p className="text-sm text-right tabular-nums">
                          {existing
                            ? `$${(existing.costoTotal / pedido.cantidadTrabix).toLocaleString('es-CO', { maximumFractionDigits: 0 })}`
                            : '—'}
                        </p>
                        <span />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {isBorrador && (
        <>
          <Separator />
          <Button onClick={() => setConfirmRecibir(true)}>Marcar como Recibido</Button>
        </>
      )}

      <ConfirmDialog
        open={confirmRecibir}
        onOpenChange={(open) => !open && setConfirmRecibir(false)}
        title="Recibir Pedido"
        description="¿Marcar este pedido como recibido? Se actualizará el stock físico y se calcularán los costos finales."
        confirmLabel="Recibir"
        onConfirm={() => {
          recibir.mutate(id, {
            onSuccess: () => {
              toast.success('Pedido recibido — stock actualizado');
              setConfirmRecibir(false);
            },
            onError: (err) => {
              toast.error(getApiError(err, 'Error al recibir pedido'));
              setConfirmRecibir(false);
            },
          });
        }}
        isLoading={recibir.isPending}
      />
    </div>
  );
}
