'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRegistrarVentaMayor, useStockDisponible } from '@/lib/hooks/use-ventas-mayor';
import { useUsuarios } from '@/lib/hooks/use-usuarios';
import { Rol, EstadoUsuario, ModalidadVentaMayor } from '@/types/enums';
import { formatCOP } from '@/lib/utils/format';
import { toast } from 'sonner';

export default function RegistrarVentaMayorPage() {
  const router = useRouter();
  const registrar = useRegistrarVentaMayor();
  const { data: vendedores } = useUsuarios({ rol: Rol.VENDEDOR, estado: EstadoUsuario.ACTIVO, take: 100 });

  const [vendedorId, setVendedorId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [conLicor, setConLicor] = useState(true);
  const [modalidad, setModalidad] = useState<ModalidadVentaMayor>(ModalidadVentaMayor.ANTICIPADO);

  const { data: stock } = useStockDisponible(vendedorId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registrar.mutate(
      { vendedorId, cantidadUnidades: Number(cantidad), conLicor, modalidad },
      {
        onSuccess: () => { toast.success('Venta mayor registrada'); router.push('/ventas-mayor'); },
        onError: (err) => toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error'),
      },
    );
  };

  return (
    <div className="space-y-4 max-w-lg">
      <div className="flex items-center gap-2">
        <Link href="/ventas-mayor"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="text-2xl font-bold">Registrar Venta Mayor</h1>
      </div>

      {stock && (
        <Card>
          <CardContent className="p-4 grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-muted-foreground">Stock Reservado</p><p className="font-bold">{stock.stockReservado}</p></div>
            <div><p className="text-muted-foreground">Stock En Casa</p><p className="font-bold">{stock.stockEnCasa}</p></div>
            <div><p className="text-muted-foreground">Stock Total</p><p className="font-bold">{stock.stockTotal}</p></div>
            <div><p className="text-muted-foreground">Máx. sin Lote Forzado</p><p className="font-bold">{stock.cantidadMaximaSinLoteForzado}</p></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Datos de la venta</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Vendedor</Label>
              <Select value={vendedorId} onValueChange={setVendedorId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar vendedor" /></SelectTrigger>
                <SelectContent>
                  {vendedores?.data.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.nombre} {v.apellidos}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cantidad de Unidades</Label>
              <Input type="number" min="1" value={cantidad} onChange={(e) => setCantidad(e.target.value)} required />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={conLicor} onCheckedChange={setConLicor} />
              <Label>Con Licor</Label>
            </div>
            <div className="space-y-2">
              <Label>Modalidad</Label>
              <Select value={modalidad} onValueChange={(v) => setModalidad(v as ModalidadVentaMayor)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ModalidadVentaMayor.ANTICIPADO}>Anticipado</SelectItem>
                  <SelectItem value={ModalidadVentaMayor.CONTRAENTREGA}>Contraentrega</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={registrar.isPending || !vendedorId} className="w-full">
              {registrar.isPending ? 'Registrando...' : 'Registrar Venta'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
