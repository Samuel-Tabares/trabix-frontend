'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/shared/data-table';
import { EstadoBadge } from '@/components/shared/estado-badge';
import { useCuadresMayor } from '@/lib/hooks/use-cuadres-mayor';
import { EstadoCuadre } from '@/types/enums';
import { formatCOP, formatDate } from '@/lib/utils/format';
import type { CuadreMayor } from '@/types/cuadre-mayor.types';

const PAGE_SIZE = 10;

export default function CuadresMayorPage() {
  const [page, setPage] = useState(1);
  const [estado, setEstado] = useState<string>('all');

  const { data, isLoading } = useCuadresMayor({
    estado: estado !== 'all' ? (estado as EstadoCuadre) : undefined,
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const columns = [
    {
      key: 'vendedor',
      label: 'Vendedor',
      render: (_: unknown, row: CuadreMayor) => row.vendedor ? `${row.vendedor.nombre} ${row.vendedor.apellidos}` : (row.vendedorNombre ?? row.vendedorId.slice(0, 8)),
    },
    { key: 'cantidadUnidades', label: 'Unidades' },
    { key: 'ingresoBruto', label: 'Ingreso', render: (val: number) => formatCOP(val) },
    { key: 'montoTotalAdmin', label: 'Admin', render: (val: number) => formatCOP(val) },
    { key: 'estado', label: 'Estado', render: (val: string) => <EstadoBadge estado={val} /> },
    { key: 'fechaRegistro', label: 'Fecha', render: (val: string) => formatDate(val), className: 'hidden md:table-cell' },
    {
      key: 'id',
      label: '',
      render: (_: unknown, row: CuadreMayor) => (
        <Link href={`/cuadres-mayor/${row.id}`}><Button size="sm" variant="outline">Ver</Button></Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Cuadres Mayor</h1>

      <Select value={estado} onValueChange={(v) => { setEstado(v); setPage(1); }}>
        <SelectTrigger className="w-44"><SelectValue placeholder="Estado" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value={EstadoCuadre.PENDIENTE}>Pendiente</SelectItem>
          <SelectItem value={EstadoCuadre.EXITOSO}>Exitoso</SelectItem>
        </SelectContent>
      </Select>

      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} emptyMessage="No hay cuadres mayor" pagination={{ page, pageSize: PAGE_SIZE, total: data?.total ?? 0, onPageChange: setPage }} />
    </div>
  );
}
