'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/shared/data-table';
import { EstadoBadge } from '@/components/shared/estado-badge';
import { useEquipamientos } from '@/lib/hooks/use-equipamiento';
import { EstadoEquipamiento } from '@/types/enums';
import { formatCOP, formatDate } from '@/lib/utils/format';
import type { Equipamiento } from '@/types/equipamiento.types';

const PAGE_SIZE = 10;

export default function EquipamientoPage() {
  const [page, setPage] = useState(1);
  const [estado, setEstado] = useState<string>('all');

  const { data, isLoading } = useEquipamientos({
    estado: estado !== 'all' ? (estado as EstadoEquipamiento) : undefined,
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const columns = [
    {
      key: 'vendedor',
      label: 'Vendedor',
      render: (_: unknown, row: Equipamiento) => row.vendedor ? `${row.vendedor.nombre} ${row.vendedor.apellidos}` : row.vendedorId.slice(0, 8),
    },
    { key: 'estado', label: 'Estado', render: (val: string) => <EstadoBadge estado={val} /> },
    { key: 'deudaTotal', label: 'Deuda', render: (val: number) => formatCOP(val) },
    { key: 'mensualidadActual', label: 'Mensualidad', render: (val: number) => formatCOP(val), className: 'hidden md:table-cell' },
    { key: 'fechaSolicitud', label: 'Solicitud', render: (val: string) => formatDate(val), className: 'hidden md:table-cell' },
    {
      key: 'id',
      label: '',
      render: (_: unknown, row: Equipamiento) => (
        <Link href={`/equipamiento/${row.id}`}><Button size="sm" variant="outline">Ver</Button></Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Equipamiento</h1>

      <Select value={estado} onValueChange={(v) => { setEstado(v); setPage(1); }}>
        <SelectTrigger className="w-44"><SelectValue placeholder="Estado" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value={EstadoEquipamiento.SOLICITADO}>Solicitado</SelectItem>
          <SelectItem value={EstadoEquipamiento.ACTIVO}>Activo</SelectItem>
          <SelectItem value={EstadoEquipamiento.DEVUELTO}>Devuelto</SelectItem>
          <SelectItem value={EstadoEquipamiento.DANADO}>Dañado</SelectItem>
          <SelectItem value={EstadoEquipamiento.PERDIDO}>Perdido</SelectItem>
        </SelectContent>
      </Select>

      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} emptyMessage="No hay equipamiento" pagination={{ page, pageSize: PAGE_SIZE, total: data?.total ?? 0, onPageChange: setPage }} />
    </div>
  );
}
