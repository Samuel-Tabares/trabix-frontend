'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DataTable } from '@/components/shared/data-table';
import { useVentas } from '@/lib/hooks/use-ventas';
import { formatCOP, formatDate } from '@/lib/utils/format';
import type { Venta } from '@/types/venta.types';
import { Button } from '@/components/ui/button';

const PAGE_SIZE = 10;

export default function VentasAdminPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useVentas({
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const columns = [
    {
      key: 'vendedorNombre',
      label: 'Vendedor',
      render: (_: unknown, row: Venta) => (
        <div>
          <p className="font-medium text-sm">{row.vendedorNombre ?? '—'}</p>
          <p className="text-xs text-muted-foreground">{row.vendedorTelefono ?? ''}</p>
        </div>
      ),
    },
    { key: 'cantidadTrabix', label: 'TRABIX' },
    { key: 'montoTotal', label: 'Monto', render: (val: number) => formatCOP(val) },
    { key: 'fechaRegistro', label: 'Fecha', render: (val: string) => formatDate(val), className: 'hidden md:table-cell' },
    {
      key: 'id',
      label: 'Acciones',
      render: (_: unknown, row: Venta) => (
        <Link href={`/ventas/${row.id}`}><Button size="sm" variant="outline">Ver</Button></Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Ventas</h1>

      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} emptyMessage="No hay ventas" pagination={{ page, pageSize: PAGE_SIZE, total: data?.total ?? 0, onPageChange: setPage }} />
    </div>
  );
}
