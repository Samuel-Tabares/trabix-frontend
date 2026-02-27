'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/shared/data-table';
import { EstadoBadge } from '@/components/shared/estado-badge';
import { SearchInput } from '@/components/shared/search-input';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useEquipamientos, useActivarEquipamiento } from '@/lib/hooks/use-equipamiento';
import { EstadoEquipamiento } from '@/types/enums';
import { formatCOP, formatDate } from '@/lib/utils/format';
import type { Equipamiento } from '@/types/equipamiento.types';

const PAGE_SIZE = 25;

export default function EquipamientoPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [estado, setEstado] = useState<string>('all');
  const [searchVendedor, setSearchVendedor] = useState('');
  const [pendingId, setPendingId] = useState<string | null>(null);

  const activar = useActivarEquipamiento();

  const { data, isLoading } = useEquipamientos({
    estado: estado !== 'all' ? (estado as EstadoEquipamiento) : undefined,
    searchVendedor: searchVendedor || undefined,
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
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Equipamiento</h1>

      <div className="flex items-center gap-3">
        <SearchInput
          value={searchVendedor}
          onChange={(v) => { setSearchVendedor(v); setPage(1); }}
          placeholder="Buscar vendedor..."
          className="w-64"
        />
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
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        emptyMessage="No hay equipamiento"
        pagination={{ page, pageSize: PAGE_SIZE, total: data?.total ?? 0, onPageChange: setPage }}
        onRowClick={(row) => router.push(`/equipamiento/${row.id}`)}
        rowActions={(row: Equipamiento) =>
          row.estado === EstadoEquipamiento.SOLICITADO ? (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => { e.stopPropagation(); setPendingId(row.id); }}
            >
              Activar
            </Button>
          ) : null
        }
      />

      <ConfirmDialog
        open={pendingId !== null}
        onOpenChange={(open) => { if (!open) setPendingId(null); }}
        title="Activar equipamiento"
        description="¿Confirmar la entrega y activación del equipamiento?"
        confirmLabel="Activar"
        onConfirm={() => { activar.mutate(pendingId!); setPendingId(null); }}
        isLoading={activar.isPending}
      />
    </div>
  );
}
