'use client';

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

export default function MisLotesPage() {
  const { data, isLoading } = useMisLotes({ take: 50 });
  const lotes = data?.data ?? [];

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
          {lotes.map((lote) => (
            <Link key={lote.id} href={`/mis-lotes/${lote.id}`}>
              <Card className="hover:bg-accent/50 transition-colors">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {lote.cantidadTrabix} TRABIX
                    </span>
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
