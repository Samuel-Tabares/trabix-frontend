'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Loader2, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCrearVenta } from '@/lib/hooks/use-ventas';
import { TipoVenta } from '@/types/enums';
import type { DetalleVentaRequest } from '@/types/venta.types';

const TIPOS: { tipo: TipoVenta; label: string; description: string }[] = [
  { tipo: TipoVenta.PROMO, label: 'Promo', description: 'Paquete promocional' },
  { tipo: TipoVenta.UNIDAD, label: 'Unidad', description: 'Venta individual' },
  { tipo: TipoVenta.SIN_LICOR, label: 'Sin Licor', description: 'Sin contenido alcohólico' },
  { tipo: TipoVenta.REGALO, label: 'Regalo', description: 'Obsequio (máx 8 por lote)' },
];

export default function VenderPage() {
  const router = useRouter();
  const crearVenta = useCrearVenta();

  const [cantidades, setCantidades] = useState<Record<TipoVenta, number>>({
    [TipoVenta.PROMO]: 0,
    [TipoVenta.UNIDAD]: 0,
    [TipoVenta.SIN_LICOR]: 0,
    [TipoVenta.REGALO]: 0,
  });

  const updateCantidad = (tipo: TipoVenta, delta: number) => {
    setCantidades((prev) => ({
      ...prev,
      [tipo]: Math.max(0, prev[tipo] + delta),
    }));
  };

  const totalTrabix = Object.values(cantidades).reduce((a, b) => a + b, 0);
  const hayAlgo = totalTrabix > 0;

  const handleSubmit = async () => {
    const detalles: DetalleVentaRequest[] = Object.entries(cantidades)
      .filter(([, cantidad]) => cantidad > 0)
      .map(([tipo, cantidad]) => ({
        tipo: tipo as TipoVenta,
        cantidad,
      }));

    if (detalles.length === 0) return;

    try {
      await crearVenta.mutateAsync({ detalles });
      toast.success('Venta registrada exitosamente', {
        description: 'Tu venta está pendiente de aprobación.',
      });
      router.push('/mis-ventas');
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Error al registrar la venta';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Registrar Venta</h1>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Cantidad por tipo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {TIPOS.map(({ tipo, label, description }) => (
            <div key={tipo}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateCantidad(tipo, -1)}
                    disabled={cantidades[tipo] === 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center text-lg font-semibold">
                    {cantidades[tipo]}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateCantidad(tipo, 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Separator className="mt-3" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total TRABIX</span>
            <span className="text-xl font-bold">{totalTrabix}</span>
          </div>
        </CardContent>
      </Card>

      <Button
        className="w-full h-12 text-base gap-2"
        disabled={!hayAlgo || crearVenta.isPending}
        onClick={handleSubmit}
      >
        {crearVenta.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ShoppingCart className="h-4 w-4" />
        )}
        Registrar Venta
      </Button>
    </div>
  );
}
