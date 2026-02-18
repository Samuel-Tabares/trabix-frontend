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
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useLotes, useActivarLote, useCancelarLote } from '@/lib/hooks/use-lotes';
import { EstadoLote } from '@/types/enums';
import { formatCOP, formatDate } from '@/lib/utils/format';
import { toast } from 'sonner';
import type { Lote } from '@/types/lote.types';

const PAGE_SIZE = 10;

export default function LotesPage() {
  const [page, setPage] = useState(1);
  const [estado, setEstado] = useState<string>('all');
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'activar' | 'cancelar'>('activar');

  const activar = useActivarLote();
  const cancelar = useCancelarLote();

  const { data, isLoading } = useLotes({
    estado: estado !== 'all' ? (estado as EstadoLote) : undefined,
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const columns = [
    {
      key: 'cantidadTrabix',
      label: 'TRABIX',
      render: (_: unknown, row: Lote) => (
        <Link href={`/lotes/${row.id}`} className="font-medium hover:underline">
          {row.cantidadTrabix}
        </Link>
      ),
    },
    {
      key: 'modeloNegocio',
      label: 'Modelo',
      render: (val: string) => val.replace('MODELO_', '').replace('_', '/'),
    },
    { key: 'estado', label: 'Estado', render: (val: string) => <EstadoBadge estado={val} /> },
    { key: 'inversionTotal', label: 'Inversión', render: (val: number) => formatCOP(val) },
    { key: 'porcentajeRecaudo', label: 'Recaudo', render: (val: number) => `${val.toFixed(0)}%` },
    { key: 'fechaCreacion', label: 'Fecha', render: (val: string) => formatDate(val), className: 'hidden md:table-cell' },
    {
      key: 'id',
      label: 'Acciones',
      render: (_: unknown, row: Lote) => row.estado === 'CREADO' ? (
        <div className="flex gap-1">
          <Button size="sm" variant="outline" onClick={(e) => { e.preventDefault(); setActionId(row.id); setActionType('activar'); }}>Activar</Button>
          <Button size="sm" variant="outline" onClick={(e) => { e.preventDefault(); setActionId(row.id); setActionType('cancelar'); }}>Cancelar</Button>
        </div>
      ) : (
        <Link href={`/lotes/${row.id}`}><Button size="sm" variant="outline">Ver</Button></Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lotes</h1>
        <Link href="/lotes/crear"><Button><Plus className="mr-2 h-4 w-4" />Crear Lote</Button></Link>
      </div>

      <Select value={estado} onValueChange={(v) => { setEstado(v); setPage(1); }}>
        <SelectTrigger className="w-44"><SelectValue placeholder="Estado" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value={EstadoLote.CREADO}>Creado</SelectItem>
          <SelectItem value={EstadoLote.ACTIVO}>Activo</SelectItem>
          <SelectItem value={EstadoLote.FINALIZADO}>Finalizado</SelectItem>
        </SelectContent>
      </Select>

      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} emptyMessage="No hay lotes" pagination={{ page, pageSize: PAGE_SIZE, total: data?.total ?? 0, onPageChange: setPage }} />

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
