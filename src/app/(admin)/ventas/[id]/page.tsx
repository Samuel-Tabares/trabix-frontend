'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTable } from '@/components/shared/data-table';
import { useVenta } from '@/lib/hooks/use-ventas';
import { formatCOP, formatDate } from '@/lib/utils/format';

export default function VentaDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: venta, isLoading } = useVenta(id);

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-60 w-full" /></div>;
  if (!venta) return <p className="text-muted-foreground">Venta no encontrada</p>;

  const detalleColumns = [
    { key: 'tipo', label: 'Tipo' },
    { key: 'cantidad', label: 'Cantidad' },
    { key: 'precioUnitario', label: 'Precio Unit.', render: (val: number) => formatCOP(val) },
    { key: 'subtotal', label: 'Subtotal', render: (val: number) => formatCOP(val) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/ventas"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="text-2xl font-bold">Venta — {venta.cantidadTrabix} TRABIX</h1>
      </div>

      {(venta.vendedorNombre || venta.vendedorTelefono) && (
        <Card>
          <CardHeader><CardTitle className="text-base">Vendedor</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            {venta.vendedorNombre && (
              <div><p className="text-muted-foreground">Nombre</p><p className="font-semibold">{venta.vendedorNombre}</p></div>
            )}
            {venta.vendedorTelefono && (
              <div><p className="text-muted-foreground">Celular</p><p className="font-semibold">{venta.vendedorTelefono}</p></div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Información</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-muted-foreground">Monto Total</p><p className="font-semibold">{formatCOP(venta.montoTotal)}</p></div>
          <div><p className="text-muted-foreground">TRABIX</p><p className="font-semibold">{venta.cantidadTrabix}</p></div>
          <div><p className="text-muted-foreground">Regalos</p><p>{venta.cantidadRegalos}</p></div>
          <div><p className="text-muted-foreground">Fecha</p><p>{formatDate(venta.fechaRegistro)}</p></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Detalles</CardTitle></CardHeader>
        <CardContent>
          <DataTable columns={detalleColumns} data={venta.detalles} emptyMessage="Sin detalles" />
        </CardContent>
      </Card>
    </div>
  );
}
