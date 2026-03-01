'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EstadoBadge } from '@/components/shared/estado-badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useVentaMayor, useConfirmarVentaMayor, useEliminarVentaMayor } from '@/lib/hooks/use-ventas-mayor';
import { formatCOP, formatDate } from '@/lib/utils/format';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function VentaMayorDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: venta, isLoading } = useVentaMayor(id);
  const confirmar = useConfirmarVentaMayor();
  const eliminar = useEliminarVentaMayor();
  const [confirmConfirmar, setConfirmConfirmar] = useState(false);
  const [confirmEliminar, setConfirmEliminar] = useState(false);

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-60 w-full" /></div>;
  if (!venta) return <p className="text-muted-foreground">Venta mayor no encontrada</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/ventas-mayor"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="text-2xl font-bold">Venta Mayor — {venta.cantidadUnidades} uds</h1>
        <EstadoBadge estado={venta.estado} />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Información</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-muted-foreground">Vendedor</p><p className="font-medium">{venta.vendedor ? `${venta.vendedor.nombre} ${venta.vendedor.apellidos}` : venta.vendedorId.slice(0, 8)}</p></div>
          <div><p className="text-muted-foreground">Unidades</p><p className="font-medium">{venta.cantidadUnidades}</p></div>
          <div><p className="text-muted-foreground">Precio Unit.</p><p className="font-medium">{formatCOP(venta.precioUnidad)}</p></div>
          <div><p className="text-muted-foreground">Ingreso Bruto</p><p className="font-semibold">{formatCOP(venta.ingresoBruto)}</p></div>
          <div><p className="text-muted-foreground">Con Licor</p><p>{venta.conLicor ? 'Sí' : 'No'}</p></div>
          <div><p className="text-muted-foreground">Modalidad</p><p>{venta.modalidad}</p></div>
          <div><p className="text-muted-foreground">Fecha</p><p>{formatDate(venta.fechaRegistro)}</p></div>
          {venta.fechaCompletada && <div><p className="text-muted-foreground">Confirmada</p><p>{formatDate(venta.fechaCompletada)}</p></div>}
        </CardContent>
      </Card>

      {venta.fuentesStock && venta.fuentesStock.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Fuentes de Stock</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {venta.fuentesStock.map((f, i) => (
              <div key={i} className="flex justify-between rounded-md border p-2 text-sm">
                <span>Tanda: {f.tandaId.slice(0, 8)}...</span>
                <span>{f.cantidadConsumida} uds — {f.tipoStock}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {venta.cuadreMayorId && (
        <Card>
          <CardHeader><CardTitle className="text-base">Cuadre Mayor</CardTitle></CardHeader>
          <CardContent>
            <Link href={`/cuadres-mayor/${venta.cuadreMayorId}`}>
              <Button variant="outline" className="w-full">Ver Cuadre Mayor</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {venta.estado === 'PENDIENTE' && (
        <div className="flex gap-2">
          <Button onClick={() => setConfirmConfirmar(true)} className="flex-1">
            Confirmar Venta
          </Button>
          <Button variant="destructive" onClick={() => setConfirmEliminar(true)}>
            Cancelar
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={confirmConfirmar}
        onOpenChange={setConfirmConfirmar}
        title="Confirmar Venta Mayor"
        description="¿Confirmar esta venta mayor? Se creará el cuadre mayor con los datos financieros actuales."
        onConfirm={() => {
          confirmar.mutate(id, {
            onSuccess: () => { toast.success('Venta confirmada. Cuadre mayor creado.'); setConfirmConfirmar(false); },
            onError: () => toast.error('Error al confirmar la venta'),
          });
        }}
        isLoading={confirmar.isPending}
      />

      <ConfirmDialog
        open={confirmEliminar}
        onOpenChange={setConfirmEliminar}
        title="Cancelar Venta Mayor"
        description="¿Cancelar y eliminar esta venta mayor? Esta acción no se puede deshacer. El stock no se verá afectado."
        onConfirm={() => {
          eliminar.mutate(id, {
            onSuccess: () => {
              toast.success('Venta eliminada');
              setConfirmEliminar(false);
              router.push('/ventas-mayor');
            },
            onError: () => toast.error('Error al eliminar la venta'),
          });
        }}
        isLoading={eliminar.isPending}
      />
    </div>
  );
}
