'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EstadoBadge } from '@/components/shared/estado-badge';
import { useVentaMayor } from '@/lib/hooks/use-ventas-mayor';
import { formatCOP, formatDate } from '@/lib/utils/format';

export default function MiVentaMayorDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: venta, isLoading } = useVentaMayor(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (!venta) {
    return <p className="text-muted-foreground">Venta mayor no encontrada</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/mis-ventas-mayor">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Venta Mayor</h1>
        <EstadoBadge estado={venta.estado} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Información</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Unidades</p>
            <p className="font-semibold text-lg">{venta.cantidadUnidades}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Ingreso Bruto</p>
            <p className="font-semibold text-lg">{formatCOP(venta.ingresoBruto)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Precio Unit.</p>
            <p>{formatCOP(venta.precioUnidad)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Modalidad</p>
            <p>{venta.modalidad}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Con Licor</p>
            <p>{venta.conLicor ? 'Sí' : 'No'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Fecha</p>
            <p>{formatDate(venta.fechaRegistro)}</p>
          </div>
          {venta.fechaCompletada && (
            <div>
              <p className="text-muted-foreground">Confirmada</p>
              <p>{formatDate(venta.fechaCompletada)}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {venta.fuentesStock && venta.fuentesStock.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fuentes de Stock</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {venta.fuentesStock.map((f, i) => (
              <div key={i} className="flex justify-between rounded-md border p-2 text-sm">
                <span className="text-muted-foreground">Tanda {f.tandaId.slice(0, 8)}…</span>
                <span>
                  {f.cantidadConsumida} uds — {f.tipoStock}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {venta.cuadreMayorId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cuadre Mayor</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              Tu cuadre mayor está siendo procesado por el administrador.
            </p>
            <p className="text-xs text-muted-foreground">ID: {venta.cuadreMayorId}</p>
          </CardContent>
        </Card>
      )}

      {venta.estado === 'PENDIENTE' && (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardContent className="p-4">
            <p className="text-sm text-yellow-800">
              Esta venta está pendiente de confirmación por el administrador.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
