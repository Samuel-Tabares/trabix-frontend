'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useRegistrarSalida } from '@/lib/hooks/use-fondo-recompensas';
import { useUsuarios } from '@/lib/hooks/use-usuarios';
import { Rol } from '@/types/enums';
import { getApiError } from '@/lib/utils/errors';
import { toast } from 'sonner';

export default function RegistrarSalidaPage() {
  const router = useRouter();
  const registrar = useRegistrarSalida();
  const { data: vendedores } = useUsuarios({ rol: Rol.VENDEDOR, take: 100 });

  const [monto, setMonto] = useState('');
  const [concepto, setConcepto] = useState('');
  const [vendedorId, setVendedorId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registrar.mutate(
      { monto: Number(monto), concepto, vendedorBeneficiarioId: vendedorId },
      {
        onSuccess: () => {
          toast.success('Salida registrada');
          router.push('/fondo-recompensas');
        },
        onError: (err) => {
          toast.error(getApiError(err, 'Error al registrar salida'));
        },
      },
    );
  };

  return (
    <div className="space-y-4 max-w-lg">
      <div className="flex items-center gap-2">
        <Link href="/fondo-recompensas"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <h1 className="text-2xl font-bold">Registrar Salida</h1>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Datos de la Salida</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Vendedor Beneficiario</Label>
              <Select value={vendedorId} onValueChange={setVendedorId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar vendedor" /></SelectTrigger>
                <SelectContent>
                  {vendedores?.data?.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.nombre} {v.apellidos}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Monto</Label>
              <Input type="number" step="0.01" min={1} value={monto} onChange={(e) => setMonto(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Concepto</Label>
              <Textarea value={concepto} onChange={(e) => setConcepto(e.target.value)} placeholder="Descripción de la salida..." required />
            </div>
            <Button type="submit" disabled={registrar.isPending || !monto || !concepto || !vendedorId}>
              {registrar.isPending ? 'Registrando...' : 'Registrar Salida'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
