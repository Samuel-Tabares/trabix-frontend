'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingCart, Package, ClipboardList, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/inicio', label: 'Inicio', icon: Home },
  { href: '/vender', label: 'Vender', icon: ShoppingCart },
  { href: '/mis-lotes', label: 'Mis Lotes', icon: Package },
  { href: '/mis-cuadres', label: 'Cuadres', icon: ClipboardList },
  { href: '/perfil', label: 'Perfil', icon: User },
];

export function VendedorBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors',
                isActive
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground',
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive && 'text-primary')} />
              <span>{item.label}</span>
              {isActive && (
                <div className="absolute top-0 h-0.5 w-10 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
