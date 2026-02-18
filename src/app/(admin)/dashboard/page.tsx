'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingCart,
  DollarSign,
  Package,
  ClipboardCheck,
  Users,
  Wallet,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/shared/stat-card';
import { ListSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import {
  useResumenDashboard,
  useVentasPeriodo,
  useCuadresPendientes,
} from '@/lib/hooks/use-admin-dashboard';
import { formatCOP, formatDate } from '@/lib/utils/format';

type Periodo = 'dia' | 'semana' | 'mes';

export default function DashboardPage() {
  const [periodo, setPeriodo] = useState<Periodo>('dia');
  const { data: resumen, isLoading: loadingResumen } = useResumenDashboard();
  const { data: ventasPeriodo, isLoading: loadingVentas } = useVentasPeriodo(periodo);
  const { data: cuadresPendientes, isLoading: loadingCuadres } = useCuadresPendientes();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Ventas Hoy"
          value={resumen?.ventasHoy ?? 0}
          icon={<ShoppingCart className="h-5 w-5" />}
          isLoading={loadingResumen}
        />
        <StatCard
          title="Ingresos Hoy"
          value={resumen ? formatCOP(resumen.ingresosHoy) : '$0'}
          icon={<DollarSign className="h-5 w-5" />}
          isLoading={loadingResumen}
        />
        <StatCard
          title="Stock Fisico"
          value={resumen?.stockFisico ?? 0}
          icon={<Package className="h-5 w-5" />}
          isLoading={loadingResumen}
        />
        <StatCard
          title="Cuadres Pendientes"
          value={resumen?.cuadresPendientes ?? 0}
          icon={<ClipboardCheck className="h-5 w-5" />}
          isLoading={loadingResumen}
        />
        <StatCard
          title="Vendedores Activos"
          value={resumen?.vendedoresActivos ?? 0}
          icon={<Users className="h-5 w-5" />}
          isLoading={loadingResumen}
        />
        <StatCard
          title="Saldo Fondo"
          value={resumen ? formatCOP(resumen.saldoFondo) : '$0'}
          icon={<Wallet className="h-5 w-5" />}
          isLoading={loadingResumen}
        />
      </div>

      {/* Ventas por periodo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ventas por Periodo</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={periodo}
            onValueChange={(v) => setPeriodo(v as Periodo)}
          >
            <TabsList>
              <TabsTrigger value="dia">Dia</TabsTrigger>
              <TabsTrigger value="semana">Semana</TabsTrigger>
              <TabsTrigger value="mes">Mes</TabsTrigger>
            </TabsList>
            <TabsContent value={periodo} className="mt-4">
              {loadingVentas ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-40" />
                </div>
              ) : ventasPeriodo ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Ventas</p>
                    <p className="text-xl font-bold">{ventasPeriodo.totalVentas}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Ingresos</p>
                    <p className="text-xl font-bold">
                      {formatCOP(ventasPeriodo.totalIngresos)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">TRABIX Vendidos</p>
                    <p className="text-xl font-bold">{ventasPeriodo.trabixVendidos}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No hay datos para este periodo.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Cuadres pendientes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cuadres Pendientes</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingCuadres ? (
            <ListSkeleton count={3} />
          ) : !cuadresPendientes || cuadresPendientes.length === 0 ? (
            <EmptyState
              icon={<ClipboardCheck className="h-10 w-10" />}
              title="Sin cuadres pendientes"
              description="No hay cuadres por revisar en este momento."
            />
          ) : (
            <div className="space-y-2">
              {cuadresPendientes.map((cuadre) => (
                <Link
                  key={cuadre.cuadreId}
                  href={`/cuadres/${cuadre.cuadreId}`}
                >
                  <div className="flex items-center justify-between rounded-md border p-3 hover:bg-accent/50 transition-colors">
                    <div>
                      <p className="text-sm font-medium">
                        {cuadre.vendedorNombre}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Tanda {cuadre.numeroTanda}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {formatCOP(cuadre.montoEsperado)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(cuadre.fechaPendiente)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
