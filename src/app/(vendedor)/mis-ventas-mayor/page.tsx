'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/empty-state';
import { ListSkeleton } from '@/components/shared/loading-skeleton';
import { EstadoBadge } from '@/components/shared/estado-badge';
import { useVentasMayor } from '@/lib/hooks/use-ventas-mayor';
import { useAuthStore } from '@/lib/store/auth.store';
import { formatCOP, formatDate } from '@/lib/utils/format';

export default function MisVentasMayorPage() {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useVentasMayor({
    vendedorId: user?.id,
    take: 50,
  });
  const ventas = data?.data ?? [];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Ventas al Mayor</h1>

      {isLoading ? (
        <ListSkeleton count={5} />
      ) : ventas.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="h-12 w-12" />}
          title="Sin ventas al mayor"
          description="Aún no tienes ventas al mayor registradas."
        />
      ) : (
        <div className="space-y-2">
          {ventas.map((venta) => (
            <Link key={venta.id} href={`/mis-ventas-mayor/${venta.id}`}>
              <Card className="hover:bg-accent/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{venta.cantidadUnidades} TRABIX</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCOP(venta.ingresoBruto)} — {venta.modalidad}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(venta.fechaRegistro)}
                      </p>
                    </div>
                    <EstadoBadge estado={venta.estado} />
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
