'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ClipboardCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EstadoBadge } from '@/components/shared/estado-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { ListSkeleton } from '@/components/shared/loading-skeleton';
import { useCuadres } from '@/lib/hooks/use-cuadres';
import { formatCOP, formatDate } from '@/lib/utils/format';
import { EstadoCuadre } from '@/types/enums';

const FILTROS = [
  { label: 'Todos', value: undefined },
  { label: 'Pendientes', value: EstadoCuadre.PENDIENTE },
  { label: 'Exitosos', value: EstadoCuadre.EXITOSO },
] as const;

export default function MisCuadresPage() {
  const [filtro, setFiltro] = useState<EstadoCuadre | undefined>(undefined);
  const { data, isLoading } = useCuadres({ estado: filtro, take: 50 });
  const cuadres = data?.data ?? [];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Mis Cuadres</h1>

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
      ) : cuadres.length === 0 ? (
        <EmptyState
          icon={<ClipboardCheck className="h-12 w-12" />}
          title="Sin cuadres"
          description={filtro ? 'No hay cuadres con este filtro.' : 'Aún no tienes cuadres registrados.'}
        />
      ) : (
        <div className="space-y-2">
          {cuadres.map((cuadre) => (
            <Link key={cuadre.id} href={`/mis-cuadres/${cuadre.id}`}>
              <Card className="hover:bg-accent/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        Tanda #{cuadre.tanda.numero}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Esperado: {formatCOP(cuadre.montoEsperado)}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <EstadoBadge estado={cuadre.estado} />
                      {cuadre.fechaPendiente && (
                        <p className="text-xs text-muted-foreground">
                          {formatDate(cuadre.fechaPendiente)}
                        </p>
                      )}
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
