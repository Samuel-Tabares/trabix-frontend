'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/shared/data-table';
import { SearchInput } from '@/components/shared/search-input';
import { EstadoBadge } from '@/components/shared/estado-badge';
import { useUsuarios } from '@/lib/hooks/use-usuarios';
import { Rol, EstadoUsuario } from '@/types/enums';
import type { Usuario } from '@/types/usuario.types';

const PAGE_SIZE = 10;

export default function UsuariosPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [rol, setRol] = useState<string>('all');
  const [estado, setEstado] = useState<string>('all');

  const { data, isLoading } = useUsuarios({
    search: search || undefined,
    rol: rol !== 'all' ? (rol as Rol) : undefined,
    estado: estado !== 'all' ? (estado as EstadoUsuario) : undefined,
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const columns = [
    {
      key: 'nombreCompleto',
      label: 'Nombre',
      render: (_: unknown, row: Usuario) => (
        <Link href={`/usuarios/${row.id}`} className="font-medium hover:underline">
          {row.nombre} {row.apellidos}
        </Link>
      ),
    },
    { key: 'cedula', label: 'Cédula' },
    { key: 'email', label: 'Email', className: 'hidden md:table-cell' },
    {
      key: 'rol',
      label: 'Rol',
      render: (val: string) => <EstadoBadge estado={val} />,
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (val: string) => <EstadoBadge estado={val} />,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <Link href="/usuarios/crear">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Crear Usuario
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Buscar por nombre o email..."
          className="sm:w-64"
        />
        <Select value={rol} onValueChange={(v) => { setRol(v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los roles</SelectItem>
            <SelectItem value={Rol.ADMIN}>Admin</SelectItem>
            <SelectItem value={Rol.VENDEDOR}>Vendedor</SelectItem>
            <SelectItem value={Rol.RECLUTADOR}>Reclutador</SelectItem>
          </SelectContent>
        </Select>
        <Select value={estado} onValueChange={(v) => { setEstado(v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value={EstadoUsuario.ACTIVO}>Activo</SelectItem>
            <SelectItem value={EstadoUsuario.INACTIVO}>Inactivo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        emptyMessage="No se encontraron usuarios"
        pagination={{
          page,
          pageSize: PAGE_SIZE,
          total: data?.total ?? 0,
          onPageChange: setPage,
        }}
      />

      <Link href="/usuarios/eliminados">
        <Button variant="outline" size="sm">Ver eliminados</Button>
      </Link>
    </div>
  );
}
