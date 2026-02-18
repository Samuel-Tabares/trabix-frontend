import { Badge } from '@/components/ui/badge';
import { ESTADO_COLORS } from '@/lib/utils/constants';
import { cn } from '@/lib/utils';

interface EstadoBadgeProps {
  estado: string;
  className?: string;
}

export function EstadoBadge({ estado, className }: EstadoBadgeProps) {
  const colorClass = ESTADO_COLORS[estado] ?? 'bg-gray-100 text-gray-600';
  const label = estado.replace(/_/g, ' ');

  return (
    <Badge variant="secondary" className={cn(colorClass, 'font-medium', className)}>
      {label}
    </Badge>
  );
}
