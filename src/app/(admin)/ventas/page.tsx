'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/shared/data-table';
import { EstadoBadge } from '@/components/shared/estado-badge';
import { useVentas } from '@/lib/hooks/use-ventas';
import { EstadoVenta } from '@/types/enums';
import { formatCOP, formatDate } from '@/lib/utils/format';
import type { Venta } from '@/types/venta.types';
import { Button } from '@/components/ui/button';

const PAGE_SIZE = 10;

export default function VentasAdminPage() {
  const [page, setPage] = useState(1);
  const [estado, setEstado] = useState<string>('all');

  const { data, isLoading } = useVentas({
    estado: estado !== 'all' ? (estado as EstadoVenta) : undefined,
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const columns = [
    { key: 'cantidadTrabix', label: 'TRABIX' },
    { key: 'montoTotal', label: 'Monto', render: (val: number) => formatCOP(val) },
    { key: 'estado', label: 'Estado', render: (val: string) => <EstadoBadge estado={val} /> },
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

      <Select value={estado} onValueChange={(v) => { setEstado(v); setPage(1); }}>
        <SelectTrigger className="w-44"><SelectValue placeholder="Estado" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value={EstadoVenta.PENDIENTE}>Pendiente</SelectItem>
          <SelectItem value={EstadoVenta.APROBADA}>Aprobada</SelectItem>
          <SelectItem value={EstadoVenta.RECHAZADA}>Rechazada</SelectItem>
        </SelectContent>
      </Select>

      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} emptyMessage="No hay ventas" pagination={{ page, pageSize: PAGE_SIZE, total: data?.total ?? 0, onPageChange: setPage }} />
    </div>
  );
}
