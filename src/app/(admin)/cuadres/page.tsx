'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/shared/data-table';
import { EstadoBadge } from '@/components/shared/estado-badge';
import { useCuadres } from '@/lib/hooks/use-cuadres';
import { EstadoCuadre } from '@/types/enums';
import { formatCOP, formatDate } from '@/lib/utils/format';
import type { Cuadre } from '@/types/cuadre.types';

const PAGE_SIZE = 10;

export default function CuadresPage() {
  const [page, setPage] = useState(1);
  const [estado, setEstado] = useState<string>('all');

  const { data, isLoading } = useCuadres({
    estado: estado !== 'all' ? (estado as EstadoCuadre) : undefined,
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const columns = [
    { key: 'concepto', label: 'Concepto', render: (val: string) => val.replace(/_/g, ' ') },
    { key: 'montoEsperado', label: 'Esperado', render: (val: number) => formatCOP(val) },
    { key: 'montoRecibido', label: 'Recibido', render: (val: number) => formatCOP(val) },
    { key: 'estado', label: 'Estado', render: (val: string) => <EstadoBadge estado={val} /> },
    { key: 'fechaPendiente', label: 'Fecha', render: (val: string | null) => val ? formatDate(val) : '—', className: 'hidden md:table-cell' },
    {
      key: 'id',
      label: '',
      render: (_: unknown, row: Cuadre) => (
        <Link href={`/cuadres/${row.id}`}><Button size="sm" variant="outline">Ver</Button></Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Cuadres</h1>

      <Select value={estado} onValueChange={(v) => { setEstado(v); setPage(1); }}>
        <SelectTrigger className="w-44"><SelectValue placeholder="Estado" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value={EstadoCuadre.INACTIVO}>Inactivo</SelectItem>
          <SelectItem value={EstadoCuadre.PENDIENTE}>Pendiente</SelectItem>
          <SelectItem value={EstadoCuadre.EXITOSO}>Exitoso</SelectItem>
        </SelectContent>
      </Select>

      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} emptyMessage="No hay cuadres" pagination={{ page, pageSize: PAGE_SIZE, total: data?.total ?? 0, onPageChange: setPage }} />
    </div>
  );
}
