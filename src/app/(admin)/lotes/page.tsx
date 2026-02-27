'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/shared/data-table';
import { SearchInput } from '@/components/shared/search-input';
import { EstadoBadge } from '@/components/shared/estado-badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useLotes, useActivarLote, useCancelarLote } from '@/lib/hooks/use-lotes';
import { EstadoLote } from '@/types/enums';
import { formatCOP, formatDate } from '@/lib/utils/format';
import { toast } from 'sonner';
import type { Lote } from '@/types/lote.types';

const PAGE_SIZE = 25;

export default function LotesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [estado, setEstado] = useState<string>('all');
  const [searchVendedor, setSearchVendedor] = useState('');
  const [minTrabix, setMinTrabix] = useState('');
  const [maxTrabix, setMaxTrabix] = useState('');
  // Estado "committed" — solo se actualiza al presionar Enter
  const [minTrabixQuery, setMinTrabixQuery] = useState('');
  const [maxTrabixQuery, setMaxTrabixQuery] = useState('');

  const [actionId, setActionId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'activar' | 'cancelar'>('activar');

  const activar = useActivarLote();
  const cancelar = useCancelarLote();

  const { data, isLoading } = useLotes({
    estado: estado !== 'all' ? (estado as EstadoLote) : undefined,
    searchVendedor: searchVendedor || undefined,
    minTrabix: minTrabixQuery ? Number(minTrabixQuery) : undefined,
    maxTrabix: maxTrabixQuery ? Number(maxTrabixQuery) : undefined,
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const columns = [
    {
      key: 'vendedor',
      label: 'Vendedor',
      render: (_: unknown, row: Lote) => (
        <span className="font-medium">
          {row.vendedor ? `${row.vendedor.nombre} ${row.vendedor.apellidos}` : row.vendedorId}
        </span>
      ),
    },
    { key: 'cantidadTrabix', label: 'TRABIX' },
    {
      key: 'estado',
      label: 'Estado',
      render: (val: string) => <EstadoBadge estado={val} />,
    },
    {
      key: 'inversionTotal',
      label: 'Inversión',
      render: (val: number) => formatCOP(val),
      className: 'hidden md:table-cell',
    },
    {
      key: 'fechaActivacion',
      label: 'Activado',
      render: (val: string | null) => val ? formatDate(val) : '—',
      className: 'hidden md:table-cell',
    },
  ];

  const rowActions = (row: Lote) => {
    if (row.estado !== EstadoLote.CREADO) return null;
    return (
      <div className="flex gap-1 justify-end">
        <Button
          size="sm"
          onClick={() => { setActionId(row.id); setActionType('activar'); }}
        >
          Activar
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => { setActionId(row.id); setActionType('cancelar'); }}
        >
          Cancelar
        </Button>
      </div>
    );
  };

  const resetPage = () => setPage(1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lotes</h1>
        <Link href="/lotes/crear">
          <Button><Plus className="mr-2 h-4 w-4" />Crear Lote</Button>
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <SearchInput
          value={searchVendedor}
          onChange={(v) => { setSearchVendedor(v); resetPage(); }}
          placeholder="Buscar por vendedor..."
          className="sm:w-56"
        />
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min TRABIX"
            value={minTrabix}
            onChange={(e) => setMinTrabix(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { setMinTrabixQuery(minTrabix); resetPage(); }
            }}
            className="w-32"
            min={1}
          />
          <span className="text-muted-foreground text-sm">–</span>
          <Input
            type="number"
            placeholder="Max TRABIX"
            value={maxTrabix}
            onChange={(e) => setMaxTrabix(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { setMaxTrabixQuery(maxTrabix); resetPage(); }
            }}
            className="w-32"
            min={1}
          />
        </div>
        <Select value={estado} onValueChange={(v) => { setEstado(v); resetPage(); }}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value={EstadoLote.CREADO}>Creado</SelectItem>
            <SelectItem value={EstadoLote.ACTIVO}>Activo</SelectItem>
            <SelectItem value={EstadoLote.FINALIZADO}>Finalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        emptyMessage="No hay lotes"
        pagination={{
          page,
          pageSize: PAGE_SIZE,
          total: data?.total ?? 0,
          onPageChange: setPage,
        }}
        onRowClick={(row) => router.push(`/lotes/${row.id}`)}
        rowActions={rowActions}
      />

      <ConfirmDialog
        open={!!actionId}
        onOpenChange={(open) => { if (!open) setActionId(null); }}
        title={actionType === 'activar' ? 'Activar Lote' : 'Cancelar Lote'}
        description={actionType === 'activar' ? '¿Activar este lote?' : '¿Cancelar este lote? Esta acción no se puede deshacer.'}
        variant={actionType === 'cancelar' ? 'destructive' : 'default'}
        confirmLabel={actionType === 'activar' ? 'Activar' : 'Cancelar Lote'}
        onConfirm={() => {
          if (!actionId) return;
          const mutation = actionType === 'activar' ? activar : cancelar;
          mutation.mutate(actionId, {
            onSuccess: () => { toast.success(actionType === 'activar' ? 'Lote activado' : 'Lote cancelado'); setActionId(null); },
            onError: () => toast.error('Error en la operación'),
          });
        }}
        isLoading={activar.isPending || cancelar.isPending}
      />
    </div>
  );
}
