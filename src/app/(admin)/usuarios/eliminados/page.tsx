'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/shared/data-table';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { useUsuariosEliminados, useRestaurarUsuario } from '@/lib/hooks/use-usuarios';
import type { Usuario } from '@/types/usuario.types';
import { toast } from 'sonner';

export default function UsuariosEliminadosPage() {
  const { data, isLoading } = useUsuariosEliminados();
  const restaurar = useRestaurarUsuario();
  const [restoreId, setRestoreId] = useState<string | null>(null);

  const columns = [
    {
      key: 'nombre',
      label: 'Nombre',
      render: (_: unknown, row: Usuario) => `${row.nombre} ${row.apellidos}`,
    },
    { key: 'cedula', label: 'Cédula' },
    { key: 'email', label: 'Email' },
    { key: 'rol', label: 'Rol' },
    {
      key: 'id',
      label: 'Acciones',
      render: (_: unknown, row: Usuario) => (
        <Button variant="outline" size="sm" onClick={() => setRestoreId(row.id)}>
          Restaurar
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/usuarios">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold">Usuarios Eliminados</h1>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        emptyMessage="No hay usuarios eliminados"
      />

      <ConfirmDialog
        open={!!restoreId}
        onOpenChange={(open) => { if (!open) setRestoreId(null); }}
        title="Restaurar usuario"
        description="¿Estás seguro de restaurar este usuario?"
        confirmLabel="Restaurar"
        onConfirm={() => {
          if (!restoreId) return;
          restaurar.mutate(restoreId, {
            onSuccess: () => { toast.success('Usuario restaurado'); setRestoreId(null); },
            onError: () => toast.error('Error al restaurar'),
          });
        }}
        isLoading={restaurar.isPending}
      />
    </div>
  );
}
