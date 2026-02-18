'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EstadoBadge } from '@/components/shared/estado-badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useVentaMayor, useCompletarVentaMayor } from '@/lib/hooks/use-ventas-mayor';
import { formatCOP, formatDate } from '@/lib/utils/format';
import { toast } from 'sonner';

export default function VentaMayorDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: venta, isLoading } = useVentaMayor(id);
  const completar = useCompletarVentaMayor();
  const [confirmCompletar, setConfirmCompletar] = useState(false);

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
          {venta.fechaCompletada && <div><p className="text-muted-foreground">Completada</p><p>{formatDate(venta.fechaCompletada)}</p></div>}
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

      {venta.estado === 'PENDIENTE' && (
        <Button onClick={() => setConfirmCompletar(true)}>Completar Venta</Button>
      )}

      <ConfirmDialog
        open={confirmCompletar}
        onOpenChange={setConfirmCompletar}
        title="Completar Venta Mayor"
        description="¿Marcar esta venta mayor como completada?"
        onConfirm={() => {
          completar.mutate(id, {
            onSuccess: () => { toast.success('Venta completada'); setConfirmCompletar(false); },
            onError: () => toast.error('Error al completar'),
          });
        }}
        isLoading={completar.isPending}
      />
    </div>
  );
}
