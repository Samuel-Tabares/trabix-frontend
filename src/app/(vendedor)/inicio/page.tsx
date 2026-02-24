'use client';

import Link from 'next/link';
import { ShoppingCart, Package, FileCheck, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { EstadoBadge } from '@/components/shared/estado-badge';
import { useMisLotes } from '@/lib/hooks/use-lotes';
import { useVentas } from '@/lib/hooks/use-ventas';
import { useCuadres } from '@/lib/hooks/use-cuadres';
import { useMiniCuadres } from '@/lib/hooks/use-mini-cuadres';
import { useAuthStore } from '@/lib/store/auth.store';
import { formatCOP } from '@/lib/utils/format';
import { EstadoLote } from '@/types/enums';

export default function InicioPage() {
  const user = useAuthStore((s) => s.user);

  const { data: lotesData, isLoading: lotesLoading } = useMisLotes({
    estado: EstadoLote.ACTIVO,
    take: 1,
  });

  const { data: ventasData, isLoading: ventasLoading } = useVentas({
    take: 5,
    orderBy: 'fechaRegistro',
    orderDirection: 'desc',
  });

  const { data: cuadresData, isLoading: cuadresLoading } = useCuadres({
    estado: 'PENDIENTE' as never,
    take: 1,
  });
  const { data: miniCuadres } = useMiniCuadres();

  const loteActivo = lotesData?.data?.[0];
  const tandaActiva = loteActivo?.tandas?.find(
    (t) => t.estado === 'EN_CASA' || t.estado === 'LIBERADA' || t.estado === 'EN_TRANSITO',
  );
  const ultimasVentas = ventasData?.data ?? [];
  const cuadrePendiente = cuadresData?.data?.[0];
  const miniCuadrePendiente = miniCuadres?.find((mc) => mc.estado === 'PENDIENTE');

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">
        Hola, {user?.nombre ?? 'Vendedor'}
      </h1>

      {/* Stock de tanda activa */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-4 w-4" />
            Mi Stock
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lotesLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-8 w-24" />
            </div>
          ) : tandaActiva ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Tanda {tandaActiva.numero} — Lote de {loteActivo!.cantidadTrabix}
                </span>
                <EstadoBadge estado={tandaActiva.estado} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {tandaActiva.stockActual}
                </span>
                <span className="text-sm text-muted-foreground">
                  de {tandaActiva.stockInicial} TRABIX
                </span>
              </div>
              <Progress value={tandaActiva.porcentajeStockRestante} className="h-2" />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No tienes una tanda activa. Solicita un lote para empezar.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Botón registrar venta */}
      <Link href="/vender">
        <Button className="w-full h-14 text-lg gap-2" size="lg">
          <ShoppingCart className="h-5 w-5" />
          Registrar Venta
        </Button>
      </Link>

      {/* Cuadre pendiente */}
      {cuadresLoading ? (
        <Card>
          <CardContent className="p-4">
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      ) : cuadrePendiente ? (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">
                  Cuadre Pendiente
                </p>
                <p className="text-sm text-yellow-700">
                  Debes transferir {formatCOP(cuadrePendiente.montoEsperadoAjustado)}
                </p>
              </div>
              <Link href={`/mis-cuadres/${cuadrePendiente.id}`}>
                <Button variant="outline" size="sm">
                  Ver
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Mini-cuadre pendiente */}
      {!cuadresLoading && miniCuadrePendiente && (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">
                  Cierre de Lote Pendiente
                </p>
                <p className="text-sm text-yellow-700">
                  Debes transferir {formatCOP(miniCuadrePendiente.montoFinal)} para cerrar tu lote
                </p>
              </div>
              <Link href={`/mis-cuadres/mini/${miniCuadrePendiente.id}`}>
                <Button variant="outline" size="sm">
                  Ver
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Últimas ventas */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Últimas Ventas
          </h2>
          <Link href="/mis-ventas" className="text-sm text-primary">
            Ver todas
          </Link>
        </div>
        {ventasLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-3">
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : ultimasVentas.length > 0 ? (
          <div className="space-y-2">
            {ultimasVentas.map((venta) => (
              <Link key={venta.id} href={`/mis-ventas/${venta.id}`}>
                <Card className="hover:bg-accent/50 transition-colors">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          {venta.cantidadTrabix} TRABIX — {formatCOP(venta.montoTotal)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(venta.fechaRegistro).toLocaleDateString('es-CO')}
                        </p>
                      </div>
                      <EstadoBadge estado={venta.estado} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Aún no has registrado ventas
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
