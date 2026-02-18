'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import {
  useTiposInsumo, useCrearTipoInsumo, useModificarTipoInsumo, useEliminarTipoInsumo,
} from '@/lib/hooks/use-configuraciones';
import { formatDate } from '@/lib/utils/format';
import { toast } from 'sonner';

export default function TiposInsumoPage() {
  const { data: tipos, isLoading } = useTiposInsumo();
  const crear = useCrearTipoInsumo();
  const modificar = useModificarTipoInsumo();
  const eliminar = useEliminarTipoInsumo();

  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [esObligatorio, setEsObligatorio] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCrear = (e: React.FormEvent) => {
    e.preventDefault();
    crear.mutate(
      { nombre, esObligatorio },
      {
        onSuccess: () => { toast.success('Tipo de insumo creado'); setShowForm(false); setNombre(''); setEsObligatorio(false); },
        onError: () => toast.error('Error al crear'),
      },
    );
  };

  const handleModificar = (id: string) => {
    modificar.mutate(
      { id, data: { nombre: editNombre } },
      {
        onSuccess: () => { toast.success('Tipo actualizado'); setEditingId(null); },
        onError: () => toast.error('Error al actualizar'),
      },
    );
  };

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-40 w-full" /></div>;

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center gap-2">
        <Link href="/configuraciones"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="text-2xl font-bold">Tipos de Insumo</h1>
      </div>

      <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
        <Plus className="h-4 w-4 mr-1" />{showForm ? 'Cancelar' : 'Nuevo Tipo'}
      </Button>

      {showForm && (
        <Card>
          <CardContent className="pt-4">
            <form onSubmit={handleCrear} className="space-y-3">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={esObligatorio} onCheckedChange={setEsObligatorio} />
                <Label>Es obligatorio</Label>
              </div>
              <Button type="submit" size="sm" disabled={crear.isPending}>Crear</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {!tipos || tipos.length === 0 ? (
          <p className="text-muted-foreground">No hay tipos de insumo</p>
        ) : (
          tipos.map((tipo) => (
            <Card key={tipo.id}>
              <CardContent className="flex items-center justify-between py-3">
                <div className="flex-1">
                  {editingId === tipo.id ? (
                    <div className="flex items-center gap-2">
                      <Input value={editNombre} onChange={(e) => setEditNombre(e.target.value)} className="max-w-xs" />
                      <Button size="sm" onClick={() => handleModificar(tipo.id)} disabled={modificar.isPending}>Guardar</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancelar</Button>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium text-sm">{tipo.nombre}</p>
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        <span>{tipo.esObligatorio ? 'Obligatorio' : 'Opcional'}</span>
                        <span>{tipo.activo ? 'Activo' : 'Inactivo'}</span>
                        <span>{formatDate(tipo.fechaCreacion)}</span>
                      </div>
                    </div>
                  )}
                </div>
                {editingId !== tipo.id && (
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => { setEditingId(tipo.id); setEditNombre(tipo.nombre); }}>Editar</Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => setDeleteId(tipo.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Eliminar Tipo de Insumo"
        description="¿Eliminar este tipo de insumo?"
        variant="destructive"
        onConfirm={() => {
          if (deleteId) {
            eliminar.mutate(deleteId, {
              onSuccess: () => { toast.success('Tipo eliminado'); setDeleteId(null); },
              onError: () => toast.error('Error al eliminar'),
            });
          }
        }}
        isLoading={eliminar.isPending}
      />
    </div>
  );
}
