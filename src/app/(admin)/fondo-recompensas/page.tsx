'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTable } from '@/components/shared/data-table';
import { useSaldoFondo, useTransaccionesFondo } from '@/lib/hooks/use-fondo-recompensas';
import { TipoTransaccionFondo } from '@/types/enums';
import { formatCOP, formatDate } from '@/lib/utils/format';
import type { MovimientoFondo } from '@/types/fondo.types';

const PAGE_SIZE = 25;

export default function FondoRecompensasPage() {
  const [page, setPage] = useState(1);
  const [tipo, setTipo] = useState<string>('all');

  const { data: saldo, isLoading: loadingSaldo } = useSaldoFondo();
  const { data: transacciones, isLoading: loadingTx } = useTransaccionesFondo({
    tipo: tipo !== 'all' ? tipo : undefined,
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const columns = [
    { key: 'tipo', label: 'Tipo', render: (val: string) => <span className={val === 'ENTRADA' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>{val}</span> },
    { key: 'monto', label: 'Monto', render: (val: number, row: MovimientoFondo) => <span className={row.tipo === 'ENTRADA' ? 'text-green-600' : 'text-red-600'}>{formatCOP(val)}</span> },
    { key: 'concepto', label: 'Concepto' },
    { key: 'fechaTransaccion', label: 'Fecha', render: (val: string) => formatDate(val), className: 'hidden md:table-cell' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Fondo de Recompensas</h1>
        <Link href="/fondo-recompensas/salida"><Button size="sm"><Plus className="h-4 w-4 mr-1" />Registrar Salida</Button></Link>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Saldo Actual</CardTitle></CardHeader>
        <CardContent>
          {loadingSaldo ? <Skeleton className="h-10 w-32" /> : <p className="text-3xl font-bold">{formatCOP(saldo?.saldo ?? 0)}</p>}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Transacciones</h2>
        <Select value={tipo} onValueChange={(v) => { setTipo(v); setPage(1); }}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Tipo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value={TipoTransaccionFondo.ENTRADA}>Entrada</SelectItem>
            <SelectItem value={TipoTransaccionFondo.SALIDA}>Salida</SelectItem>
          </SelectContent>
        </Select>

        <DataTable columns={columns} data={transacciones?.data ?? []} isLoading={loadingTx} emptyMessage="No hay transacciones" pagination={{ page, pageSize: PAGE_SIZE, total: transacciones?.total ?? 0, onPageChange: setPage }} />
      </div>
    </div>
  );
}
