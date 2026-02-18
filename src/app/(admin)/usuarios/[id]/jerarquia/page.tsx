'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EstadoBadge } from '@/components/shared/estado-badge';
import { useJerarquiaUsuario } from '@/lib/hooks/use-usuarios';
import { formatCOP } from '@/lib/utils/format';
import type { UsuarioJerarquia } from '@/types/usuario.types';

function NodoJerarquia({ nodo, nivel }: { nodo: UsuarioJerarquia; nivel: number }) {
  return (
    <div style={{ marginLeft: nivel * 24 }}>
      <div className="rounded-md border p-3 mb-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">
              {nodo.usuario.nombre} {nodo.usuario.apellidos}
            </p>
            <EstadoBadge estado={nodo.usuario.rol} className="mt-1" />
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <p>Reclutados: {nodo.totalReclutados}</p>
            {nodo.ganancias && (
              <p>Ganancias: {formatCOP(nodo.ganancias.gananciasVendedor)}</p>
            )}
          </div>
        </div>
      </div>
      {nodo.reclutados.map((child) => (
        <NodoJerarquia key={child.usuario.id} nodo={child} nivel={nivel + 1} />
      ))}
    </div>
  );
}

export default function JerarquiaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading } = useJerarquiaUsuario(id);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href={`/usuarios/${id}`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold">Jerarquía de Reclutamiento</h1>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Árbol de reclutamiento</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-3/4 ml-6" />
              <Skeleton className="h-16 w-1/2 ml-12" />
            </div>
          ) : data ? (
            <NodoJerarquia nodo={data} nivel={0} />
          ) : (
            <p className="text-sm text-muted-foreground">Sin datos de jerarquía</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
