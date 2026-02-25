'use client';

import Link from 'next/link';
import { Receipt } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/empty-state';
import { ListSkeleton } from '@/components/shared/loading-skeleton';
import { useVentas } from '@/lib/hooks/use-ventas';
import { formatCOP } from '@/lib/utils/format';

export default function MisVentasPage() {
  const { data, isLoading } = useVentas({ take: 50 });
  const ventas = data?.data ?? [];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Mis Ventas</h1>

      {isLoading ? (
        <ListSkeleton count={5} />
      ) : ventas.length === 0 ? (
        <EmptyState
          icon={<Receipt className="h-12 w-12" />}
          title="Sin ventas"
          description="Aún no has registrado ventas."
        />
      ) : (
        <div className="space-y-2">
          {ventas.map((venta) => (
            <Link key={venta.id} href={`/mis-ventas/${venta.id}`}>
              <Card className="hover:bg-accent/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {venta.cantidadTrabix} TRABIX
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatCOP(venta.montoTotal)}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(venta.fechaRegistro).toLocaleDateString('es-CO')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
