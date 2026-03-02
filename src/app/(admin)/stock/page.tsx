'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTable } from '@/components/shared/data-table';
import { EstadoBadge } from '@/components/shared/estado-badge';
import { useStockAdmin, useDeficit, useStockReservado } from '@/lib/hooks/use-admin-stock';
import { usePedidosStock } from '@/lib/hooks/use-pedidos-stock';
import { EstadoPedidoStock } from '@/types/enums';
import { formatCOP, formatDate } from '@/lib/utils/format';
import type { PedidoStockResponse } from '@/types/stock.types';

const PAGE_SIZE = 25;

export default function StockPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [estadoPedido, setEstadoPedido] = useState<string>('all');

  const { data: stock, isLoading: loadingStock } = useStockAdmin();
  const { data: deficit, isLoading: loadingDeficit } = useDeficit();
  const { data: reservado, isLoading: loadingReservado } = useStockReservado();
  const { data: pedidos, isLoading: loadingPedidos } = usePedidosStock({
    estado: estadoPedido !== 'all' ? (estadoPedido as EstadoPedidoStock) : undefined,
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const columns = [
    { key: 'cantidadTrabix', label: 'Cantidad' },
    { key: 'costoTotal', label: 'Costo Total', render: (val: number) => formatCOP(val) },
    { key: 'costoRealPorTrabix', label: 'Costo/Ud', render: (val: number) => formatCOP(val) },
    { key: 'estado', label: 'Estado', render: (val: string) => <EstadoBadge estado={val} /> },
    { key: 'fechaCreacion', label: 'Fecha', render: (val: string) => formatDate(val), className: 'hidden md:table-cell' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Stock</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Stock Físico</CardTitle></CardHeader>
          <CardContent>{loadingStock ? <Skeleton className="h-8 w-20" /> : <p className="text-2xl font-bold">{stock?.stockFisico ?? 0}</p>}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Déficit</CardTitle></CardHeader>
          <CardContent>{loadingDeficit ? <Skeleton className="h-8 w-20" /> : <p className={`text-2xl font-bold ${deficit?.hayDeficit ? 'text-red-600' : 'text-green-600'}`}>{deficit?.deficit ?? 0}</p>}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Stock Reservado</CardTitle></CardHeader>
          <CardContent>{loadingReservado ? <Skeleton className="h-8 w-20" /> : <p className="text-2xl font-bold">{reservado?.totalReservado ?? 0}</p>}</CardContent>
        </Card>
      </div>

      {!loadingReservado && reservado && reservado.porVendedor && reservado.porVendedor.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Reservado por Vendedor</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="py-2 text-left font-medium">Vendedor</th>
                  <th className="py-2 text-right font-medium">Lotes activos</th>
                  <th className="py-2 text-right font-medium">Total reservado</th>
                </tr>
              </thead>
              <tbody>
                {reservado.porVendedor.map((v) => (
                  <tr key={v.vendedorId} className="border-b last:border-0">
                    <td className="py-2">{v.vendedorNombre}</td>
                    <td className="py-2 text-right text-muted-foreground">{v.lotesActivos}</td>
                    <td className="py-2 text-right font-semibold">{v.cantidadReservada} uds</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-lg font-semibold">Pedidos de Stock</h2>
          <div className="flex gap-2">
            <Link href="/stock/tipos-insumo">
              <Button size="sm" variant="outline"><Settings2 className="h-4 w-4 mr-1" />Tipos de Insumo</Button>
            </Link>
            <Link href="/stock/pedidos/crear">
              <Button size="sm"><Plus className="h-4 w-4 mr-1" />Nuevo Pedido</Button>
            </Link>
          </div>
        </div>

        <Select value={estadoPedido} onValueChange={(v) => { setEstadoPedido(v); setPage(1); }}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value={EstadoPedidoStock.BORRADOR}>Borrador</SelectItem>
            <SelectItem value={EstadoPedidoStock.RECIBIDO}>Recibido</SelectItem>
          </SelectContent>
        </Select>

        <DataTable
          columns={columns}
          data={pedidos?.data ?? []}
          isLoading={loadingPedidos}
          emptyMessage="No hay pedidos de stock"
          pagination={{ page, pageSize: PAGE_SIZE, total: pedidos?.total ?? 0, onPageChange: setPage }}
          onRowClick={(row: PedidoStockResponse) => router.push(`/stock/pedidos/${row.id}`)}
        />
      </div>
    </div>
  );
}
