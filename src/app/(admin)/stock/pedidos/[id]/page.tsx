'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { EstadoBadge } from '@/components/shared/estado-badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import {
  usePedidoStock, useAgregarCosto, useEliminarCosto,
  useConfirmarPedido, useRecibirPedido, useCancelarPedido,
} from '@/lib/hooks/use-pedidos-stock';
import { formatCOP, formatDate } from '@/lib/utils/format';
import { toast } from 'sonner';

export default function PedidoStockDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: pedido, isLoading } = usePedidoStock(id);
  const agregarCosto = useAgregarCosto();
  const eliminarCosto = useEliminarCosto();
  const confirmar = useConfirmarPedido();
  const recibir = useRecibirPedido();
  const cancelar = useCancelarPedido();

  const [showCostoForm, setShowCostoForm] = useState(false);
  const [concepto, setConcepto] = useState('');
  const [costoTotal, setCostoTotal] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [esObligatorio, setEsObligatorio] = useState(true);
  const [confirmAction, setConfirmAction] = useState<'confirmar' | 'recibir' | 'cancelar' | null>(null);
  const [motivoCancelacion, setMotivoCancelacion] = useState('');

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-60 w-full" /></div>;
  if (!pedido) return <p className="text-muted-foreground">Pedido no encontrado</p>;

  const handleAgregarCosto = (e: React.FormEvent) => {
    e.preventDefault();
    agregarCosto.mutate(
      { pedidoId: id, data: { concepto, costoTotal: Number(costoTotal), cantidad: cantidad ? Number(cantidad) : undefined, esObligatorio } },
      {
        onSuccess: () => { toast.success('Costo agregado'); setShowCostoForm(false); setConcepto(''); setCostoTotal(''); setCantidad(''); },
        onError: () => toast.error('Error al agregar costo'),
      },
    );
  };

  const handleConfirmAction = () => {
    if (confirmAction === 'confirmar') {
      confirmar.mutate(id, {
        onSuccess: () => { toast.success('Pedido confirmado'); setConfirmAction(null); },
        onError: () => toast.error('Error'),
      });
    } else if (confirmAction === 'recibir') {
      recibir.mutate(id, {
        onSuccess: () => { toast.success('Pedido recibido'); setConfirmAction(null); },
        onError: () => toast.error('Error'),
      });
    } else if (confirmAction === 'cancelar') {
      cancelar.mutate(
        { id, data: { motivo: motivoCancelacion } },
        {
          onSuccess: () => { toast.success('Pedido cancelado'); setConfirmAction(null); setMotivoCancelacion(''); },
          onError: () => toast.error('Error'),
        },
      );
    }
  };

  const isBorrador = pedido.estado === 'BORRADOR';
  const isConfirmado = pedido.estado === 'CONFIRMADO';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/stock"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="text-2xl font-bold">Pedido de Stock</h1>
        <EstadoBadge estado={pedido.estado} />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Información</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-muted-foreground">Cantidad</p><p className="font-semibold">{pedido.cantidadTrabix} uds</p></div>
          <div><p className="text-muted-foreground">Costo Total</p><p className="font-semibold">{formatCOP(pedido.costoTotal)}</p></div>
          <div><p className="text-muted-foreground">Costo/Trabix</p><p>{formatCOP(pedido.costoRealPorTrabix)}</p></div>
          <div><p className="text-muted-foreground">Fecha</p><p>{formatDate(pedido.fechaCreacion)}</p></div>
          {pedido.fechaRecepcion && <div><p className="text-muted-foreground">Recibido</p><p>{formatDate(pedido.fechaRecepcion)}</p></div>}
          {pedido.notas && <div className="col-span-2"><p className="text-muted-foreground">Notas</p><p>{pedido.notas}</p></div>}
          {pedido.motivoCancelacion && <div className="col-span-2"><p className="text-muted-foreground">Motivo Cancelación</p><p className="text-red-600">{pedido.motivoCancelacion}</p></div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Costos ({pedido.detallesCosto.length})</CardTitle>
          {isBorrador && <Button size="sm" variant="outline" onClick={() => setShowCostoForm(!showCostoForm)}><Plus className="h-4 w-4 mr-1" />Agregar</Button>}
        </CardHeader>
        <CardContent className="space-y-3">
          {showCostoForm && (
            <form onSubmit={handleAgregarCosto} className="space-y-3 rounded-md border p-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs">Concepto</Label><Input value={concepto} onChange={(e) => setConcepto(e.target.value)} required /></div>
                <div className="space-y-1"><Label className="text-xs">Costo Total</Label><Input type="number" step="0.01" value={costoTotal} onChange={(e) => setCostoTotal(e.target.value)} required /></div>
                <div className="space-y-1"><Label className="text-xs">Cantidad (opc.)</Label><Input type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} /></div>
                <div className="flex items-center gap-2 pt-5"><Switch checked={esObligatorio} onCheckedChange={setEsObligatorio} /><Label className="text-xs">Obligatorio</Label></div>
              </div>
              <Button type="submit" size="sm" disabled={agregarCosto.isPending}>Agregar Costo</Button>
            </form>
          )}
          {pedido.detallesCosto.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin costos registrados</p>
          ) : (
            pedido.detallesCosto.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                <div>
                  <span className="font-medium">{c.concepto}</span>
                  {c.cantidad && <span className="text-muted-foreground ml-2">x{c.cantidad}</span>}
                  {c.esObligatorio && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1 rounded">Obligatorio</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{formatCOP(c.costoTotal)}</span>
                  {isBorrador && (
                    <Button size="icon" variant="ghost" className="h-7 w-7" disabled={eliminarCosto.isPending} onClick={() => {
                      eliminarCosto.mutate({ pedidoId: id, costoId: c.id }, {
                        onSuccess: () => toast.success('Costo eliminado'),
                        onError: () => toast.error('Error'),
                      });
                    }}><Trash2 className="h-3 w-3" /></Button>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {(isBorrador || isConfirmado) && (
        <>
          <Separator />
          <div className="flex gap-2 flex-wrap">
            {isBorrador && <Button onClick={() => setConfirmAction('confirmar')}>Confirmar Pedido</Button>}
            {isConfirmado && <Button onClick={() => setConfirmAction('recibir')}>Marcar como Recibido</Button>}
            {(isBorrador || isConfirmado) && <Button variant="destructive" onClick={() => setConfirmAction('cancelar')}>Cancelar Pedido</Button>}
          </div>
        </>
      )}

      <ConfirmDialog
        open={confirmAction === 'confirmar'}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title="Confirmar Pedido"
        description="¿Confirmar este pedido de stock?"
        onConfirm={handleConfirmAction}
        isLoading={confirmar.isPending}
      />
      <ConfirmDialog
        open={confirmAction === 'recibir'}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title="Recibir Pedido"
        description="¿Marcar este pedido como recibido? El stock se actualizará."
        onConfirm={handleConfirmAction}
        isLoading={recibir.isPending}
      />
      <ConfirmDialog
        open={confirmAction === 'cancelar'}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title="Cancelar Pedido"
        description={
          <div className="space-y-2">
            <p>¿Cancelar este pedido?</p>
            <Input placeholder="Motivo de cancelación" value={motivoCancelacion} onChange={(e) => setMotivoCancelacion(e.target.value)} />
          </div>
        }
        onConfirm={handleConfirmAction}
        isLoading={cancelar.isPending}
        variant="destructive"
      />
    </div>
  );
}
