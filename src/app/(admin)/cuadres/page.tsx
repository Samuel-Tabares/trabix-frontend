'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/shared/data-table';
import { EstadoBadge } from '@/components/shared/estado-badge';
import { useCuadres } from '@/lib/hooks/use-cuadres';
import { useMiniCuadres } from '@/lib/hooks/use-mini-cuadres';
import { EstadoCuadre } from '@/types/enums';
import { formatCOP, formatDate } from '@/lib/utils/format';
import type { Cuadre } from '@/types/cuadre.types';
import type { MiniCuadre } from '@/types/mini-cuadre.types';

const PAGE_SIZE = 25;

type UnifiedItem = {
  id: string;
  tipo: 'cuadre' | 'mini';
  concepto: string;
  monto: number;
  montoRecibido: number;
  estado: string;
  fechaPendiente: string | null;
  href: string;
};

function cuadreToItem(c: Cuadre): UnifiedItem {
  return {
    id: c.id,
    tipo: 'cuadre',
    concepto: c.concepto.replace(/_/g, ' '),
    monto: c.montoEsperado,
    montoRecibido: c.montoRecibido,
    estado: c.estado,
    fechaPendiente: c.fechaPendiente,
    href: `/cuadres/${c.id}`,
  };
}

function miniCuadreToItem(mc: MiniCuadre): UnifiedItem {
  return {
    id: mc.id,
    tipo: 'mini',
    concepto: 'Mini Cuadre',
    monto: mc.montoFinal,
    montoRecibido: mc.estado === 'EXITOSO' ? mc.montoFinal : 0,
    estado: mc.estado,
    fechaPendiente: mc.fechaPendiente,
    href: `/cuadres/mini/${mc.id}`,
  };
}

export default function CuadresPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [estado, setEstado] = useState<string>('all');

  const { data, isLoading } = useCuadres({
    estado: estado !== 'all' ? (estado as EstadoCuadre) : undefined,
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });
  const { data: miniCuadres } = useMiniCuadres();

  const cuadreItems = (data?.data ?? []).map(cuadreToItem);
  const miniItems = (miniCuadres ?? [])
    .filter((mc) => estado === 'all' || mc.estado === estado)
    .map(miniCuadreToItem);

  // Merge and sort by fechaPendiente desc (mini-cuadres are sorted with cuadres)
  const allItems: UnifiedItem[] = [...cuadreItems, ...miniItems].sort((a, b) => {
    const dateA = a.fechaPendiente ? new Date(a.fechaPendiente).getTime() : 0;
    const dateB = b.fechaPendiente ? new Date(b.fechaPendiente).getTime() : 0;
    return dateB - dateA;
  });

  const columns = [
    {
      key: 'concepto',
      label: 'Concepto',
      render: (val: string, row: UnifiedItem) => (
        <span className={row.tipo === 'mini' ? 'italic text-muted-foreground' : ''}>
          {val}
        </span>
      ),
    },
    { key: 'monto', label: 'Esperado', render: (val: number) => formatCOP(val) },
    { key: 'montoRecibido', label: 'Recibido', render: (val: number) => formatCOP(val) },
    { key: 'estado', label: 'Estado', render: (val: string) => <EstadoBadge estado={val} /> },
    { key: 'fechaPendiente', label: 'Fecha', render: (val: string | null) => val ? formatDate(val) : '—', className: 'hidden md:table-cell' },
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

      <DataTable
        columns={columns}
        data={allItems}
        isLoading={isLoading}
        emptyMessage="No hay cuadres"
        pagination={{ page, pageSize: PAGE_SIZE, total: (data?.total ?? 0) + miniItems.length, onPageChange: setPage }}
        onRowClick={(row) => router.push(row.href)}
      />
    </div>
  );
}
