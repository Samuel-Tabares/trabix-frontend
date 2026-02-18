'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/shared/data-table';
import { EstadoBadge } from '@/components/shared/estado-badge';
import { useVentasMayor } from '@/lib/hooks/use-ventas-mayor';
import { EstadoVentaMayor } from '@/types/enums';
import { formatCOP, formatDate } from '@/lib/utils/format';
import type { VentaMayor } from '@/types/venta-mayor.types';

const PAGE_SIZE = 10;

export default function VentasMayorPage() {
  const [page, setPage] = useState(1);
  const [estado, setEstado] = useState<string>('all');

  const { data, isLoading } = useVentasMayor({
    estado: estado !== 'all' ? (estado as EstadoVentaMayor) : undefined,
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const columns = [
    {
      key: 'vendedor',
      label: 'Vendedor',
      render: (_: unknown, row: VentaMayor) => row.vendedor ? `${row.vendedor.nombre} ${row.vendedor.apellidos}` : row.vendedorId.slice(0, 8),
    },
    { key: 'cantidadUnidades', label: 'Unidades' },
    { key: 'ingresoBruto', label: 'Ingreso', render: (val: number) => formatCOP(val) },
    { key: 'modalidad', label: 'Modalidad' },
    { key: 'estado', label: 'Estado', render: (val: string) => <EstadoBadge estado={val} /> },
    { key: 'fechaRegistro', label: 'Fecha', render: (val: string) => formatDate(val), className: 'hidden md:table-cell' },
    {
      key: 'id',
      label: '',
      render: (_: unknown, row: VentaMayor) => (
        <Link href={`/ventas-mayor/${row.id}`}><Button size="sm" variant="outline">Ver</Button></Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ventas Mayor</h1>
        <Link href="/ventas-mayor/registrar"><Button><Plus className="mr-2 h-4 w-4" />Registrar</Button></Link>
      </div>

      <Select value={estado} onValueChange={(v) => { setEstado(v); setPage(1); }}>
        <SelectTrigger className="w-44"><SelectValue placeholder="Estado" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value={EstadoVentaMayor.PENDIENTE}>Pendiente</SelectItem>
          <SelectItem value={EstadoVentaMayor.COMPLETADA}>Completada</SelectItem>
        </SelectContent>
      </Select>

      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} emptyMessage="No hay ventas al mayor" pagination={{ page, pageSize: PAGE_SIZE, total: data?.total ?? 0, onPageChange: setPage }} />
    </div>
  );
}
