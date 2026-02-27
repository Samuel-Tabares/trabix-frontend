'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/shared/data-table';
import { EstadoBadge } from '@/components/shared/estado-badge';
import { useCuadres } from '@/lib/hooks/use-cuadres';
import { useMiniCuadres } from '@/lib/hooks/use-mini-cuadres';
import { useLotes } from '@/lib/hooks/use-lotes';
import { EstadoCuadre } from '@/types/enums';
import { formatCOP, formatDate } from '@/lib/utils/format';
import type { Cuadre } from '@/types/cuadre.types';
import type { MiniCuadre } from '@/types/mini-cuadre.types';
import type { Lote } from '@/types/lote.types';

const PAGE_SIZE = 25;

type LoteInfo = { numero: number; vendedorNombre: string; cantidadTrabix: number };

type UnifiedItem = {
  id: string;
  tipo: 'cuadre' | 'mini';
  concepto: string;
  montoEsperado: number;
  tandaNumero: number | null;
  loteNumero: number | null;
  cantidadTrabix: number | null;
  vendedorNombre: string;
  estado: string;
  fechaPendiente: string | null;
  href: string;
};

const ESTADO_ORDER: Record<string, number> = { PENDIENTE: 0, EXITOSO: 1 };

export default function CuadresPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [estado, setEstado] = useState<string>('all');

  // take: 500 to bypass the backend's default limit of 20
  const { data: cuadresData, isLoading: cuadresLoading } = useCuadres({ take: 500 });
  const { data: miniCuadres, isLoading: miniLoading } = useMiniCuadres();
  // Fetch all lotes sorted by creation date asc to derive sequential numbering per vendedor
  const { data: lotesData } = useLotes({
    take: 500,
    orderBy: 'fechaCreacion',
    orderDirection: 'asc',
  });

  const isLoading = cuadresLoading || miniLoading;

  // Build loteId → { numero, vendedorNombre, cantidadTrabix }
  // Lotes are already sorted by fechaCreacion asc; group per vendedor → position = lote number
  const loteMap = useMemo(() => {
    const map = new Map<string, LoteInfo>();
    const porVendedor = new Map<string, Lote[]>();

    (lotesData?.data ?? []).forEach((lote) => {
      const list = porVendedor.get(lote.vendedorId) ?? [];
      list.push(lote);
      porVendedor.set(lote.vendedorId, list);
    });

    porVendedor.forEach((lotes) => {
      lotes
        .sort((a, b) => new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime())
        .forEach((lote, idx) => {
          const vendedorNombre = lote.vendedor
            ? `${lote.vendedor.nombre} ${lote.vendedor.apellidos}`
            : lote.vendedorId;
          map.set(lote.id, {
            numero: idx + 1,
            vendedorNombre,
            cantidadTrabix: lote.cantidadTrabix,
          });
        });
    });

    return map;
  }, [lotesData]);

  const cuadreItems = useMemo(
    () =>
      (cuadresData?.data ?? [])
        .filter((c) => c.estado !== EstadoCuadre.INACTIVO)
        .map((c: Cuadre): UnifiedItem => {
          const info = loteMap.get(c.tanda.loteId);
          return {
            id: c.id,
            tipo: 'cuadre',
            concepto: c.concepto.replace(/_/g, ' '),
            montoEsperado: c.montoEsperado,
            tandaNumero: c.tanda.numero,
            loteNumero: info?.numero ?? null,
            cantidadTrabix: info?.cantidadTrabix ?? null,
            vendedorNombre: info?.vendedorNombre ?? '—',
            estado: c.estado,
            fechaPendiente: c.fechaPendiente,
            href: `/cuadres/${c.id}`,
          };
        }),
    [cuadresData, loteMap],
  );

  const miniItems = useMemo(
    () =>
      (miniCuadres ?? [])
        .filter((mc) => mc.estado !== 'INACTIVO')
        .map((mc: MiniCuadre): UnifiedItem => {
          const info = mc.loteId ? loteMap.get(mc.loteId) : undefined;
          return {
            id: mc.id,
            tipo: 'mini',
            concepto: 'Mini Cuadre',
            montoEsperado: mc.montoFinal,
            tandaNumero: null,
            loteNumero: info?.numero ?? null,
            cantidadTrabix: info?.cantidadTrabix ?? null,
            vendedorNombre: info?.vendedorNombre ?? '—',
            estado: mc.estado,
            fechaPendiente: mc.fechaPendiente,
            href: `/cuadres/mini/${mc.id}`,
          };
        }),
    [miniCuadres, loteMap],
  );

  const allItems = useMemo(
    () =>
      [...cuadreItems, ...miniItems]
        .filter((item) => estado === 'all' || item.estado === estado)
        .sort((a, b) => {
          const orderA = ESTADO_ORDER[a.estado] ?? 99;
          const orderB = ESTADO_ORDER[b.estado] ?? 99;
          if (orderA !== orderB) return orderA - orderB;
          const dateA = a.fechaPendiente ? new Date(a.fechaPendiente).getTime() : 0;
          const dateB = b.fechaPendiente ? new Date(b.fechaPendiente).getTime() : 0;
          return dateB - dateA;
        }),
    [cuadreItems, miniItems, estado],
  );

  const pagedItems = allItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns = [
    {
      key: 'concepto',
      label: 'Concepto',
      render: (val: string, row: UnifiedItem) => (
        <div>
          <p className={row.tipo === 'mini' ? 'italic' : ''}>{val}</p>
          <p className="text-xs text-muted-foreground leading-tight mt-0.5">
            {row.tandaNumero != null && `Tanda #${row.tandaNumero} · `}
            {row.loteNumero != null && row.cantidadTrabix != null
              ? `Lote #${row.loteNumero} (${row.cantidadTrabix} TRABIX) · `
              : ''}
            {row.vendedorNombre}
          </p>
        </div>
      ),
    },
    {
      key: 'montoEsperado',
      label: 'Esperado',
      render: (val: number) => formatCOP(val),
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (val: string) => <EstadoBadge estado={val} />,
    },
    {
      key: 'fechaPendiente',
      label: 'Fecha',
      render: (val: string | null) => (val ? formatDate(val) : '—'),
      className: 'hidden md:table-cell',
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Cuadres</h1>

      <Select value={estado} onValueChange={(v) => { setEstado(v); setPage(1); }}>
        <SelectTrigger className="w-44"><SelectValue placeholder="Estado" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value={EstadoCuadre.PENDIENTE}>Pendiente</SelectItem>
          <SelectItem value={EstadoCuadre.EXITOSO}>Exitoso</SelectItem>
        </SelectContent>
      </Select>

      <DataTable
        columns={columns}
        data={pagedItems}
        isLoading={isLoading}
        emptyMessage="No hay cuadres"
        pagination={{ page, pageSize: PAGE_SIZE, total: allItems.length, onPageChange: setPage }}
        onRowClick={(row) => router.push(row.href)}
      />
    </div>
  );
}
