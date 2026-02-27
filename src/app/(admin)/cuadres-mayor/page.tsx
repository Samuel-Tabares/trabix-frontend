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
import { useCuadresMayor, useConfirmarCuadreMayor } from '@/lib/hooks/use-cuadres-mayor';
import { EstadoCuadre } from '@/types/enums';
import { formatCOP, formatDate } from '@/lib/utils/format';
import type { CuadreMayor } from '@/types/cuadre-mayor.types';

const PAGE_SIZE = 25;

export default function CuadresMayorPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [estado, setEstado] = useState<string>('all');
  const [searchVendedor, setSearchVendedor] = useState('');
  const [pendingId, setPendingId] = useState<string | null>(null);

  const confirmar = useConfirmarCuadreMayor();

  const { data, isLoading } = useCuadresMayor({
    estado: estado !== 'all' ? (estado as EstadoCuadre) : undefined,
    searchVendedor: searchVendedor || undefined,
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
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Cuadres Mayor</h1>

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
            <SelectItem value={EstadoCuadre.PENDIENTE}>Pendiente</SelectItem>
            <SelectItem value={EstadoCuadre.EXITOSO}>Exitoso</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        emptyMessage="No hay cuadres mayor"
        pagination={{ page, pageSize: PAGE_SIZE, total: data?.total ?? 0, onPageChange: setPage }}
        onRowClick={(row) => router.push(`/cuadres-mayor/${row.id}`)}
        rowActions={(row: CuadreMayor) =>
          row.estado === EstadoCuadre.PENDIENTE ? (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => { e.stopPropagation(); setPendingId(row.id); }}
            >
              Confirmar
            </Button>
          ) : null
        }
      />

      <ConfirmDialog
        open={pendingId !== null}
        onOpenChange={(open) => { if (!open) setPendingId(null); }}
        title="Confirmar cuadre mayor"
        description="¿Confirmar el procesamiento de este cuadre mayor? Esta acción ejecutará las transferencias y actualizará el inventario."
        confirmLabel="Confirmar"
        onConfirm={() => { confirmar.mutate(pendingId!); setPendingId(null); }}
        isLoading={confirmar.isPending}
      />
    </div>
  );
}
