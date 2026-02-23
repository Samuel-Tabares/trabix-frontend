'use client';

import { Bell, CheckCheck, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useNotificaciones, useMarcarLeida, useMarcarTodasLeidas } from '@/lib/hooks/use-notificaciones';
import { formatDate } from '@/lib/utils/format';

const PAGE_SIZE = 20;

export default function NotificacionesVendedorPage() {
  const { data, isLoading } = useNotificaciones({ take: PAGE_SIZE, skip: 0 });
  const marcarLeida = useMarcarLeida();
  const marcarTodas = useMarcarTodasLeidas();

  const notificaciones = data?.data ?? [];
  const noLeidas = data?.noLeidas ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificaciones
          {noLeidas > 0 && (
            <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {noLeidas}
            </span>
          )}
        </h1>
        {noLeidas > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => marcarTodas.mutate()}
            disabled={marcarTodas.isPending}
          >
            <CheckCheck className="h-4 w-4 mr-1" />
            Marcar todas
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : notificaciones.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
          <Bell className="h-10 w-10 opacity-30" />
          <p className="text-sm">No tienes notificaciones</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notificaciones.map((n) => (
            <button
              key={n.id}
              className={`w-full text-left rounded-lg border p-3 transition-colors ${
                n.leida ? 'bg-background' : 'bg-primary/5 border-primary/20'
              }`}
              onClick={() => {
                if (!n.leida) marcarLeida.mutate(n.id);
              }}
            >
              <div className="flex items-start gap-2">
                {!n.leida && (
                  <Circle className="h-2 w-2 mt-1.5 fill-primary text-primary shrink-0" />
                )}
                <div className={`space-y-0.5 ${n.leida ? 'pl-4' : ''}`}>
                  <p className="text-sm font-semibold leading-tight">{n.titulo}</p>
                  <p className="text-sm text-muted-foreground leading-snug">{n.mensaje}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(n.fechaCreacion)}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
