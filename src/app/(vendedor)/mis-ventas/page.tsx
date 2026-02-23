'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Receipt } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EstadoBadge } from '@/components/shared/estado-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { ListSkeleton } from '@/components/shared/loading-skeleton';
import { useVentas } from '@/lib/hooks/use-ventas';
import { formatCOP } from '@/lib/utils/format';
import { EstadoVenta } from '@/types/enums';

const FILTROS = [
  { label: 'Todas', value: undefined },
  { label: 'Pendientes', value: EstadoVenta.PENDIENTE },
  { label: 'Aprobadas', value: EstadoVenta.APROBADA },
] as const;

export default function MisVentasPage() {
  const [filtro, setFiltro] = useState<EstadoVenta | undefined>(undefined);
  const { data, isLoading } = useVentas({ estado: filtro, take: 50 });
  const ventas = data?.data ?? [];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Mis Ventas</h1>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTROS.map((f) => (
          <Button
            key={f.label}
            variant={filtro === f.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFiltro(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <ListSkeleton count={5} />
      ) : ventas.length === 0 ? (
        <EmptyState
          icon={<Receipt className="h-12 w-12" />}
          title="Sin ventas"
          description={filtro ? 'No hay ventas con este filtro.' : 'Aún no has registrado ventas.'}
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
                    <div className="text-right space-y-1">
                      <EstadoBadge estado={venta.estado} />
                      <p className="text-xs text-muted-foreground">
                        {new Date(venta.fechaRegistro).toLocaleDateString('es-CO')}
                      </p>
                    </div>
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
