'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useInfoSolicitud, useSolicitarLote } from '@/lib/hooks/use-lotes';
import { formatCOP } from '@/lib/utils/format';

export default function SolicitarLotePage() {
  const router = useRouter();
  const { data: info, isLoading } = useInfoSolicitud();
  const solicitarLote = useSolicitarLote();
  const [cantidad, setCantidad] = useState('');

  const cantidadNum = parseInt(cantidad, 10) || 0;
  const inversionEstimada = cantidadNum * (info?.costoPorTrabix ?? 0) * 0.5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cantidadNum || !info) return;

    try {
      await solicitarLote.mutateAsync({ cantidadTrabix: cantidadNum });
      toast.success('Lote solicitado exitosamente');
      router.push('/mis-lotes');
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Error al solicitar el lote';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/mis-lotes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Solicitar Lote</h1>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : !info?.puedeSolicitar ? (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  No puedes solicitar más lotes
                </p>
                <p className="text-sm text-yellow-700">
                  Tienes {info?.lotesCreadosActuales} lote(s) creados de un máximo de {info?.maxLotesCreados}.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Info card */}
          <Card>
            <CardContent className="p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cantidad mínima</span>
                <span className="font-medium">{info.cantidadMinima} TRABIX</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Costo por TRABIX</span>
                <span className="font-medium">{formatCOP(info.costoPorTrabix)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Inversión mínima (tu parte)</span>
                <span className="font-medium">{formatCOP(info.inversionVendedorMinima)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Solicitar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cantidad">Cantidad de TRABIX</Label>
                  <Input
                    id="cantidad"
                    type="number"
                    inputMode="numeric"
                    min={info.cantidadMinima}
                    placeholder={`Mínimo ${info.cantidadMinima}`}
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                  />
                </div>

                {cantidadNum > 0 && (
                  <div className="rounded-md bg-muted p-3 text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Tu inversión estimada</span>
                      <span className="font-semibold">{formatCOP(inversionEstimada)}</span>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    cantidadNum < (info.cantidadMinima ?? 1) ||
                    solicitarLote.isPending
                  }
                >
                  {solicitarLote.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Solicitar Lote
                </Button>
              </CardContent>
            </Card>
          </form>
        </>
      )}
    </div>
  );
}
