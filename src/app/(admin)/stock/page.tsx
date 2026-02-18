'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
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

const PAGE_SIZE = 10;

export default function StockPage() {
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
    {
      key: 'id',
      label: '',
      render: (_: unknown, row: PedidoStockResponse) => (
        <Link href={`/stock/pedidos/${row.id}`}><Button size="sm" variant="outline">Ver</Button></Link>
      ),
    },
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
          <CardContent className="space-y-2">
            {reservado.porVendedor.map((v) => (
              <div key={v.vendedorId} className="flex justify-between rounded-md border p-2 text-sm">
                <span>{v.nombre}</span>
                <span className="font-semibold">{v.cantidad} uds</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Pedidos de Stock</h2>
          <Link href="/stock/pedidos/crear"><Button size="sm"><Plus className="h-4 w-4 mr-1" />Nuevo Pedido</Button></Link>
        </div>

        <Select value={estadoPedido} onValueChange={(v) => { setEstadoPedido(v); setPage(1); }}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value={EstadoPedidoStock.BORRADOR}>Borrador</SelectItem>
            <SelectItem value={EstadoPedidoStock.CONFIRMADO}>Confirmado</SelectItem>
            <SelectItem value={EstadoPedidoStock.RECIBIDO}>Recibido</SelectItem>
            <SelectItem value={EstadoPedidoStock.CANCELADO}>Cancelado</SelectItem>
          </SelectContent>
        </Select>

        <DataTable columns={columns} data={pedidos?.data ?? []} isLoading={loadingPedidos} emptyMessage="No hay pedidos de stock" pagination={{ page, pageSize: PAGE_SIZE, total: pedidos?.total ?? 0, onPageChange: setPage }} />
      </div>
    </div>
  );
}
