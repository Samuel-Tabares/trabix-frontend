'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ClipboardCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EstadoBadge } from '@/components/shared/estado-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { ListSkeleton } from '@/components/shared/loading-skeleton';
import { useCuadres } from '@/lib/hooks/use-cuadres';
import { useMiniCuadres } from '@/lib/hooks/use-mini-cuadres';
import { useMisLotes } from '@/lib/hooks/use-lotes';
import { formatCOP, formatDate } from '@/lib/utils/format';
import { EstadoCuadre } from '@/types/enums';
import type { Cuadre } from '@/types/cuadre.types';
import type { MiniCuadre } from '@/types/mini-cuadre.types';
import type { Lote } from '@/types/lote.types';

const FILTROS = [
  { label: 'Todos', value: undefined },
  { label: 'Pendientes', value: EstadoCuadre.PENDIENTE },
  { label: 'Exitosos', value: EstadoCuadre.EXITOSO },
] as const;

type LoteInfo = { numero: number; cantidadTrabix: number; numeroTandas: number };

type UnifiedItem = {
  id: string;
  tipo: 'cuadre' | 'mini';
  label: string;
  sublabel: string | null;
  monto: number;
  estado: string;
  fechaPendiente: string | null;
  href: string;
};

function buildLoteMap(lotes: Lote[]): Map<string, LoteInfo> {
  const map = new Map<string, LoteInfo>();
  const sorted = [...lotes].sort(
    (a, b) => new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime(),
  );
  sorted.forEach((lote, idx) => {
    map.set(lote.id, { numero: idx + 1, cantidadTrabix: lote.cantidadTrabix, numeroTandas: lote.numeroTandas });
  });
  return map;
}

function cuadreToItem(c: Cuadre, loteMap: Map<string, LoteInfo>): UnifiedItem {
  const info = loteMap.get(c.tanda.loteId);
  const sublabel = info
    ? `Lote #${info.numero} · ${info.cantidadTrabix} TRABIX · ${info.numeroTandas} tandas`
    : null;
  return {
    id: c.id,
    tipo: 'cuadre',
    label: `Tanda #${c.tanda.numero}`,
    sublabel,
    monto: c.montoEsperado,
    estado: c.estado,
    fechaPendiente: c.fechaPendiente,
    href: `/mis-cuadres/${c.id}`,
  };
}

function miniCuadreToItem(mc: MiniCuadre, loteMap: Map<string, LoteInfo>): UnifiedItem {
  const info = mc.loteId ? loteMap.get(mc.loteId) : undefined;
  const sublabel = info ? `Lote #${info.numero} · ${info.cantidadTrabix} TRABIX` : null;
  return {
    id: mc.id,
    tipo: 'mini',
    label: 'Cierre de Lote',
    sublabel,
    monto: mc.montoFinal,
    estado: mc.estado,
    fechaPendiente: mc.fechaPendiente,
    href: `/mis-cuadres/mini/${mc.id}`,
  };
}

export default function MisCuadresPage() {
  const [filtro, setFiltro] = useState<EstadoCuadre | undefined>(undefined);
  const { data, isLoading } = useCuadres({ estado: filtro, take: 50 });
  const { data: miniCuadres, isLoading: miniLoading } = useMiniCuadres();
  const { data: misLotesData } = useMisLotes({ take: 200, orderBy: 'fechaCreacion', orderDirection: 'asc' });

  const loteMap = useMemo(() => buildLoteMap(misLotesData?.data ?? []), [misLotesData]);

  const cuadreItems = (data?.data ?? []).map((c) => cuadreToItem(c, loteMap));
  const miniItems = (miniCuadres ?? [])
    .filter((mc) => !filtro || (mc.estado as string) === (filtro as string))
    .map((mc) => miniCuadreToItem(mc, loteMap));

  const allItems: UnifiedItem[] = [...cuadreItems, ...miniItems].sort((a, b) => {
    const dateA = a.fechaPendiente ? new Date(a.fechaPendiente).getTime() : 0;
    const dateB = b.fechaPendiente ? new Date(b.fechaPendiente).getTime() : 0;
    return dateB - dateA;
  });

  const loading = isLoading || miniLoading;

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

      {loading ? (
        <ListSkeleton count={5} />
      ) : allItems.length === 0 ? (
        <EmptyState
          icon={<ClipboardCheck className="h-12 w-12" />}
          title="Sin cuadres"
          description={filtro ? 'No hay cuadres con este filtro.' : 'Aún no tienes cuadres registrados.'}
        />
      ) : (
        <div className="space-y-2">
          {allItems.map((item) => (
            <Link key={`${item.tipo}-${item.id}`} href={item.href}>
              <Card className="hover:bg-accent/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      {item.sublabel && (
                        <p className="text-xs text-muted-foreground leading-tight">{item.sublabel}</p>
                      )}
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Esperado: {formatCOP(item.monto)}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <EstadoBadge estado={item.estado} />
                      {item.fechaPendiente && (
                        <p className="text-xs text-muted-foreground">
                          {formatDate(item.fechaPendiente)}
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
