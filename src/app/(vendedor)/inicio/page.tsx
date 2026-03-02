'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ShoppingCart, Package, FileCheck, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { EstadoBadge } from '@/components/shared/estado-badge';
import { useMisLotes } from '@/lib/hooks/use-lotes';
import { useVentas } from '@/lib/hooks/use-ventas';
import { useVentasMayor } from '@/lib/hooks/use-ventas-mayor';
import { useCuadres } from '@/lib/hooks/use-cuadres';
import { useMiniCuadres } from '@/lib/hooks/use-mini-cuadres';
import { useAuthStore } from '@/lib/store/auth.store';
import { formatCOP } from '@/lib/utils/format';
import { EstadoLote } from '@/types/enums';

export default function InicioPage() {
  const user = useAuthStore((s) => s.user);

  // Traer todos los lotes ordenados por fecha para calcular el # secuencial por lote
  const { data: todosLotesData, isLoading: lotesLoading } = useMisLotes({
    take: 200,
    orderBy: 'fechaCreacion',
    orderDirection: 'asc',
  });

  // Mapa loteId → número secuencial (posición en el historial del vendedor)
  const loteNumeroMap = useMemo(() => {
    const map = new Map<string, number>();
    (todosLotesData?.data ?? []).forEach((lote, idx) => {
      map.set(lote.id, idx + 1);
    });
    return map;
  }, [todosLotesData]);

  const lotesActivos = useMemo(
    () => (todosLotesData?.data ?? []).filter((l) => l.estado === EstadoLote.ACTIVO),
    [todosLotesData],
  );

  const { data: ventasData, isLoading: ventasLoading } = useVentas({
    take: 5,
    orderBy: 'fechaRegistro',
    orderDirection: 'desc',
  });

  const { data: ventasMayorData } = useVentasMayor({
    vendedorId: user?.id,
    take: 3,
  });

  const { data: cuadresData, isLoading: cuadresLoading } = useCuadres({
    estado: 'PENDIENTE' as never,
    take: 1,
  });
  const { data: miniCuadres } = useMiniCuadres();

  const ultimasVentas = ventasData?.data ?? [];
  const ultimasVentasMayor = ventasMayorData?.data ?? [];
  const cuadrePendiente = cuadresData?.data?.[0];
  const miniCuadrePendiente = miniCuadres?.find((mc) => mc.estado === 'PENDIENTE');

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">
        Hola, {user?.nombre ?? 'Vendedor'}
      </h1>

      {/* Stock — todos los lotes activos */}
      <div>
        <h2 className="flex items-center gap-2 text-base font-semibold mb-2">
          <Package className="h-4 w-4" />
          Mi Stock
        </h2>
        {lotesLoading ? (
          <Card>
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-8 w-24" />
            </CardContent>
          </Card>
        ) : lotesActivos.length === 0 ? (
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                No tienes lotes activos. Solicita un lote para empezar.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {lotesActivos.map((lote) => {
              const tanda = lote.tandas?.find(
                (t) => t.estado === 'EN_CASA' || t.estado === 'EN_TRANSITO',
              );
              const loteNum = loteNumeroMap.get(lote.id);
              return (
                <Card key={lote.id}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {loteNum != null ? `Lote #${loteNum}` : 'Lote'}{' '}
                        <span className="text-xs">· {lote.cantidadTrabix} TRABIX · {lote.numeroTandas} tandas</span>
                        {tanda ? ` — Tanda ${tanda.numero}` : ''}
                      </span>
                      {tanda && <EstadoBadge estado={tanda.estado} />}
                    </div>
                    {tanda ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold">{tanda.stockActual}</span>
                          <span className="text-sm text-muted-foreground">
                            de {tanda.stockInicial} TRABIX
                          </span>
                        </div>
                        <Progress
                          value={(tanda.stockActual / tanda.stockInicial) * 100}
                          className="h-2"
                        />
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">Sin tanda activa aún</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

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

      {/* Últimas ventas al mayor */}
      {ultimasVentasMayor.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Ventas al Mayor
            </h2>
            <Link href="/mis-ventas-mayor" className="text-sm text-primary">
              Ver todas
            </Link>
          </div>
          <div className="space-y-2">
            {ultimasVentasMayor.map((venta) => (
              <Link key={venta.id} href={`/mis-ventas-mayor/${venta.id}`}>
                <Card className="hover:bg-accent/50 transition-colors">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          {venta.cantidadUnidades} TRABIX — {formatCOP(venta.ingresoBruto)}
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
        </div>
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
