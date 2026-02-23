'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Loader2, ShoppingCart, PhoneCall } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCrearVenta } from '@/lib/hooks/use-ventas';
import { getApiError } from '@/lib/utils/errors';
import { TipoVenta } from '@/types/enums';
import type { DetalleVentaRequest } from '@/types/venta.types';

// Cuántos TRABIX consume cada tipo de venta
const TRABIX_POR_TIPO: Record<TipoVenta, number> = {
  [TipoVenta.PROMO]: 2,      // 1 promo = 2 TRABIX (granizado + bono)
  [TipoVenta.UNIDAD]: 1,
  [TipoVenta.SIN_LICOR]: 1,
  [TipoVenta.REGALO]: 1,
};

const TIPOS: { tipo: TipoVenta; label: string }[] = [
  { tipo: TipoVenta.PROMO,     label: 'Promo'     },
  { tipo: TipoVenta.UNIDAD,    label: 'Unidad'    },
  { tipo: TipoVenta.SIN_LICOR, label: 'Sin Licor' },
  { tipo: TipoVenta.REGALO,    label: 'Regalo'    },
];

const pluralLabel = (tipo: TipoVenta, cantidad: number): string => {
  switch (tipo) {
    case TipoVenta.PROMO:     return cantidad >= 2 ? 'promos'   : 'promo';
    case TipoVenta.UNIDAD:    return cantidad >= 2 ? 'unidades' : 'unidad';
    case TipoVenta.SIN_LICOR: return 'sin licor'; // invariable
    case TipoVenta.REGALO:    return cantidad >= 2 ? 'regalos'  : 'regalo';
  }
};

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

  const totalTrabix = (Object.entries(cantidades) as [TipoVenta, number][]).reduce(
    (acc, [tipo, cantidad]) => acc + cantidad * TRABIX_POR_TIPO[tipo],
    0,
  );
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
      toast.error(getApiError(err, 'Error al registrar la venta'));
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
          {TIPOS.map(({ tipo, label }) => (
            <div key={tipo}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{label}</p>
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
        <CardContent className="p-4 space-y-2">
          {TIPOS.filter(({ tipo }) => cantidades[tipo] > 0).map(({ tipo }) => {
            const n = cantidades[tipo];
            const trabix = n * TRABIX_POR_TIPO[tipo];
            return (
              <div key={tipo} className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {n} {pluralLabel(tipo, n)}
                  {tipo === TipoVenta.PROMO && ' × 2'}
                </span>
                <span>{trabix} TRABIX</span>
              </div>
            );
          })}
          {hayAlgo && <Separator />}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total TRABIX</span>
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

      {/* Ventas al por mayor */}
      <Card className="border-dashed">
        <CardContent className="p-4 flex items-start gap-3">
          <PhoneCall className="h-5 w-5 mt-0.5 text-muted-foreground shrink-0" />
          <div>
            <p className="text-sm font-medium">¿Ventas al por mayor?</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Las ventas al por mayor (mayor o igual a 20 unidades) las registra el administrador.
              Contáctalo directamente para coordinar.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
