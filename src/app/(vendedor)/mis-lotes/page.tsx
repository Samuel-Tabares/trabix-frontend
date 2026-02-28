'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Plus, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { EstadoBadge } from '@/components/shared/estado-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { ListSkeleton } from '@/components/shared/loading-skeleton';
import { useMisLotes } from '@/lib/hooks/use-lotes';
import { formatCOP } from '@/lib/utils/format';

// Prioridad de grupo para ordenamiento en pantalla
const GRUPO: Record<string, number> = { CREADO: 0, ACTIVO: 1, FINALIZADO: 2 };

export default function MisLotesPage() {
  // Traer todos ordenados por fecha de creación ASC → índice = número de lote
  const { data, isLoading } = useMisLotes({ take: 50, orderBy: 'fechaCreacion', orderDirection: 'asc' });
  const lotes = data?.data ?? [];

  // Mapa loteId → número secuencial (basado en orden cronológico de creación)
  const loteNumeroMap = useMemo(() => {
    const map = new Map<string, number>();
    lotes.forEach((lote, idx) => map.set(lote.id, idx + 1));
    return map;
  }, [lotes]);

  // Ordenamiento visual: CREADO (asc fecha), ACTIVO (asc fecha), FINALIZADO (desc fecha)
  const lotesOrdenados = useMemo(
    () =>
      [...lotes].sort((a, b) => {
        const grupoA = GRUPO[a.estado] ?? 99;
        const grupoB = GRUPO[b.estado] ?? 99;
        if (grupoA !== grupoB) return grupoA - grupoB;
        const dateA = new Date(a.fechaCreacion).getTime();
        const dateB = new Date(b.fechaCreacion).getTime();
        // FINALIZADO: más nuevo primero; CREADO y ACTIVO: más viejo primero
        return a.estado === 'FINALIZADO' ? dateB - dateA : dateA - dateB;
      }),
    [lotes],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Mis Lotes</h1>
        <Link href="/mis-lotes/solicitar">
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            Solicitar
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <ListSkeleton count={3} />
      ) : lotes.length === 0 ? (
        <EmptyState
          icon={<Package className="h-12 w-12" />}
          title="No tienes lotes"
          description="Solicita tu primer lote para empezar a vender."
          action={
            <Link href="/mis-lotes/solicitar">
              <Button>Solicitar Lote</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {lotesOrdenados.map((lote) => (
            <Link key={lote.id} href={`/mis-lotes/${lote.id}`}>
              <Card className="hover:bg-accent/50 transition-colors">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">Lote #{loteNumeroMap.get(lote.id)}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {lote.cantidadTrabix} TRABIX · {lote.numeroTandas} tandas
                      </span>
                    </div>
                    <EstadoBadge estado={lote.estado} />
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Inversión: {formatCOP(lote.inversionVendedor)}</span>
                    <span>{lote.modeloNegocio.replace('MODELO_', '').replace('_', '/')}</span>
                  </div>
                  <Progress value={lote.porcentajeRecaudo} className="h-1.5" />
                  <p className="text-xs text-muted-foreground">
                    Recaudo: {lote.porcentajeRecaudo.toFixed(0)}% — {formatCOP(lote.dineroRecaudado)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
