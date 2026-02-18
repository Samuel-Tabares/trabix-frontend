'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { EstadoBadge } from '@/components/shared/estado-badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useCuadreMayor, useConfirmarCuadreMayor } from '@/lib/hooks/use-cuadres-mayor';
import { formatCOP, formatDate } from '@/lib/utils/format';
import { toast } from 'sonner';

export default function CuadreMayorDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: cuadre, isLoading } = useCuadreMayor(id);
  const confirmar = useConfirmarCuadreMayor();
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-60 w-full" /></div>;
  if (!cuadre) return <p className="text-muted-foreground">Cuadre mayor no encontrado</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/cuadres-mayor"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="text-2xl font-bold">Cuadre Mayor</h1>
        <EstadoBadge estado={cuadre.estado} />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Resumen</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-muted-foreground">Unidades</p><p className="font-medium">{cuadre.cantidadUnidades}</p></div>
          <div><p className="text-muted-foreground">Modalidad</p><p>{cuadre.modalidad}</p></div>
          <div><p className="text-muted-foreground">Ingreso Bruto</p><p className="font-semibold">{formatCOP(cuadre.ingresoBruto)}</p></div>
          <div><p className="text-muted-foreground">Precio Unit.</p><p>{formatCOP(cuadre.precioUnidad)}</p></div>
          <div><p className="text-muted-foreground">Fecha</p><p>{formatDate(cuadre.fechaRegistro)}</p></div>
          {cuadre.fechaExitoso && <div><p className="text-muted-foreground">Fecha Exitoso</p><p>{formatDate(cuadre.fechaExitoso)}</p></div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Desglose Financiero</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-muted-foreground">Deudas Saldadas</p><p>{formatCOP(cuadre.deudasSaldadas ?? 0)}</p></div>
            <div><p className="text-muted-foreground">Inv. Admin Lotes Exist.</p><p>{formatCOP(cuadre.inversionAdminLotesExistentes ?? 0)}</p></div>
            <div><p className="text-muted-foreground">Inv. Admin Lote Forzado</p><p>{formatCOP(cuadre.inversionAdminLoteForzado ?? 0)}</p></div>
            <div><p className="text-muted-foreground">Inv. Vendedor Lotes Exist.</p><p>{formatCOP(cuadre.inversionVendedorLotesExistentes ?? 0)}</p></div>
            <div><p className="text-muted-foreground">Inv. Vendedor Lote Forzado</p><p>{formatCOP(cuadre.inversionVendedorLoteForzado ?? 0)}</p></div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-muted-foreground">Ganancias Admin</p><p className="font-semibold text-green-600">{formatCOP(cuadre.gananciasAdmin ?? 0)}</p></div>
            <div><p className="text-muted-foreground">Ganancias Vendedor</p><p className="font-semibold text-green-600">{formatCOP(cuadre.gananciasVendedor ?? 0)}</p></div>
            <div><p className="text-muted-foreground">Monto Total Admin</p><p className="font-bold">{formatCOP(cuadre.montoTotalAdmin)}</p></div>
            <div><p className="text-muted-foreground">Monto Total Vendedor</p><p className="font-bold">{formatCOP(cuadre.montoTotalVendedor)}</p></div>
          </div>
        </CardContent>
      </Card>

      {cuadre.gananciasReclutadores && cuadre.gananciasReclutadores.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Ganancias Reclutadores</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {cuadre.gananciasReclutadores.map((g, i) => (
              <div key={i} className="flex justify-between rounded-md border p-2 text-sm">
                <span>Nivel {g.nivel} — {g.reclutadorId.slice(0, 8)}...</span>
                <span className="font-semibold">{formatCOP(g.monto)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {cuadre.estado === 'PENDIENTE' && (
        <Button onClick={() => setConfirmOpen(true)}>Confirmar Cuadre Mayor</Button>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirmar Cuadre Mayor"
        description="¿Confirmar este cuadre mayor?"
        onConfirm={() => {
          confirmar.mutate(id, {
            onSuccess: () => { toast.success('Cuadre mayor confirmado'); setConfirmOpen(false); },
            onError: () => toast.error('Error'),
          });
        }}
        isLoading={confirmar.isPending}
      />
    </div>
  );
}
