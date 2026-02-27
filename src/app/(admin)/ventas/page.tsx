'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/shared/data-table';
import { SearchInput } from '@/components/shared/search-input';
import { useVentas } from '@/lib/hooks/use-ventas';
import { formatCOP, formatDate } from '@/lib/utils/format';
import type { Venta } from '@/types/venta.types';

const PAGE_SIZE = 25;

export default function VentasAdminPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchVendedor, setSearchVendedor] = useState('');

  const { data, isLoading } = useVentas({
    searchVendedor: searchVendedor || undefined,
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
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Ventas</h1>

      <SearchInput
        value={searchVendedor}
        onChange={(v) => { setSearchVendedor(v); setPage(1); }}
        placeholder="Buscar vendedor..."
        className="w-64"
      />

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        emptyMessage="No hay ventas"
        pagination={{ page, pageSize: PAGE_SIZE, total: data?.total ?? 0, onPageChange: setPage }}
        onRowClick={(row) => router.push(`/ventas/${row.id}`)}
      />
    </div>
  );
}
