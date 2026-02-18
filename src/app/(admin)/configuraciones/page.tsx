'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useConfiguraciones, useModificarConfiguracion } from '@/lib/hooks/use-configuraciones';
import { formatDate } from '@/lib/utils/format';
import { toast } from 'sonner';
import type { ConfiguracionSistema } from '@/types/configuracion.types';

export default function ConfiguracionesPage() {
  const { data: configuraciones, isLoading } = useConfiguraciones();
  const modificar = useModificarConfiguracion();

  const [editConfig, setEditConfig] = useState<ConfiguracionSistema | null>(null);
  const [nuevoValor, setNuevoValor] = useState('');
  const [motivo, setMotivo] = useState('');

  const categorias = configuraciones
    ? [...new Set(configuraciones.map((c: ConfiguracionSistema) => c.categoria))]
    : [];

  const handleModificar = () => {
    if (!editConfig) return;
    modificar.mutate(
      { id: editConfig.id, data: { valor: nuevoValor, motivo: motivo || undefined } },
      {
        onSuccess: () => { toast.success('Configuración actualizada'); setEditConfig(null); },
        onError: () => toast.error('Error al actualizar'),
      },
    );
  };

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-60 w-full" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Configuraciones</h1>
        <Link href="/configuraciones/tipos-insumo"><Button variant="outline" size="sm">Tipos de Insumo</Button></Link>
      </div>

      {categorias.length === 0 ? (
        <p className="text-muted-foreground">No hay configuraciones</p>
      ) : (
        <Tabs defaultValue={categorias[0]}>
          <TabsList className="flex-wrap">
            {categorias.map((cat) => (
              <TabsTrigger key={cat} value={cat} className="capitalize">{cat.toLowerCase().replace(/_/g, ' ')}</TabsTrigger>
            ))}
          </TabsList>
          {categorias.map((cat) => (
            <TabsContent key={cat} value={cat} className="space-y-3">
              {configuraciones!
                .filter((c: ConfiguracionSistema) => c.categoria === cat)
                .map((config: ConfiguracionSistema) => (
                  <Card key={config.id}>
                    <CardContent className="flex items-center justify-between py-3">
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{config.clave}</p>
                        <p className="text-xs text-muted-foreground">{config.descripcion}</p>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>Tipo: {config.tipo}</span>
                          <span>Última mod: {formatDate(config.ultimaModificacion)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm bg-muted px-2 py-1 rounded">{config.valor}</span>
                        {config.modificable && (
                          <Button size="sm" variant="outline" onClick={() => {
                            setEditConfig(config);
                            setNuevoValor(config.valor);
                            setMotivo('');
                          }}>Editar</Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>
          ))}
        </Tabs>
      )}

      <Dialog open={!!editConfig} onOpenChange={(open) => !open && setEditConfig(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Configuración</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">{editConfig?.clave}</p>
              <p className="text-xs text-muted-foreground">{editConfig?.descripcion}</p>
            </div>
            <div className="space-y-2">
              <Label>Nuevo Valor</Label>
              <Input value={nuevoValor} onChange={(e) => setNuevoValor(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Motivo (opcional)</Label>
              <Input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Razón del cambio" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditConfig(null)}>Cancelar</Button>
            <Button onClick={handleModificar} disabled={modificar.isPending || nuevoValor === editConfig?.valor}>
              {modificar.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
