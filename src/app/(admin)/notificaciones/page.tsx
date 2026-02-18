'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/shared/data-table';
import { useNotificaciones } from '@/lib/hooks/use-notificaciones';
import { TipoNotificacion } from '@/types/enums';
import { formatDate } from '@/lib/utils/format';
import type { Notificacion } from '@/types/notificacion.types';

const PAGE_SIZE = 10;

export default function NotificacionesAdminPage() {
  const [page, setPage] = useState(1);
  const [tipo, setTipo] = useState<string>('all');

  const { data, isLoading } = useNotificaciones({
    tipo: tipo !== 'all' ? (tipo as TipoNotificacion) : undefined,
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const columns = [
    { key: 'tipo', label: 'Tipo', render: (val: string) => val.replace(/_/g, ' ') },
    { key: 'titulo', label: 'Título' },
    { key: 'mensaje', label: 'Mensaje', render: (val: string) => val.length > 60 ? val.slice(0, 60) + '...' : val },
    { key: 'leida', label: 'Leída', render: (val: boolean) => val ? 'Sí' : 'No' },
    { key: 'fechaCreacion', label: 'Fecha', render: (val: string) => formatDate(val), className: 'hidden md:table-cell' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notificaciones</h1>
        <Link href="/notificaciones/enviar"><Button size="sm"><Plus className="h-4 w-4 mr-1" />Enviar Notificación</Button></Link>
      </div>

      <Select value={tipo} onValueChange={(v) => { setTipo(v); setPage(1); }}>
        <SelectTrigger className="w-52"><SelectValue placeholder="Tipo" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          {Object.values(TipoNotificacion).map((t) => (
            <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <DataTable columns={columns} data={data?.data ?? []} isLoading={isLoading} emptyMessage="No hay notificaciones" pagination={{ page, pageSize: PAGE_SIZE, total: data?.total ?? 0, onPageChange: setPage }} />
    </div>
  );
}
