'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  ShoppingBag,
  FileCheck,
  FileCheck2,
  Warehouse,
  Wrench,
  Gift,
  Settings,
  Bell,
  LogOut,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/lib/store/auth.store';
import { useUIStore } from '@/lib/store/ui.store';
import { authApi } from '@/lib/api/auth.api';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/usuarios', label: 'Usuarios', icon: Users },
  { href: '/lotes', label: 'Lotes', icon: Package },
  { href: '/ventas', label: 'Ventas', icon: ShoppingCart },
  { href: '/ventas-mayor', label: 'Ventas Mayor', icon: ShoppingBag },
  { href: '/cuadres', label: 'Cuadres', icon: FileCheck },
  { href: '/cuadres-mayor', label: 'Cuadres Mayor', icon: FileCheck2 },
  { href: '/stock', label: 'Stock', icon: Warehouse },
  { href: '/equipamiento', label: 'Equipamiento', icon: Wrench },
  { href: '/fondo-recompensas', label: 'Fondo Recompensas', icon: Gift },
  { href: '/configuraciones', label: 'Configuraciones', icon: Settings },
  { href: '/notificaciones', label: 'Notificaciones', icon: Bell },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, accessToken, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  const handleLogout = async () => {
    try {
      // refreshToken viaja en cookie HttpOnly — solo pasamos accessToken para blacklistarlo
      await authApi.logout(accessToken ?? undefined);
    } catch {
      // Continue with local logout even if API fails
    }
    logout();
    document.cookie = 'trabix-auth=;path=/;max-age=0';
    router.push('/login');
  };

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-background transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-16',
      )}
    >
      <div className="flex h-14 items-center justify-between px-4">
        {sidebarOpen && (
          <span className="text-lg font-bold">TRABIX</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn(!sidebarOpen && 'mx-auto')}
        >
          <ChevronLeft
            className={cn(
              'h-4 w-4 transition-transform',
              !sidebarOpen && 'rotate-180',
            )}
          />
        </Button>
      </div>

      <Separator />

      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    !sidebarOpen && 'justify-center px-2',
                  )}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <Separator />

      <div className="p-2">
        {sidebarOpen && user && (
          <div className="mb-2 px-3 py-2">
            <p className="text-sm font-medium truncate">
              {user.nombre} {user.apellidos}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        )}
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start gap-3 text-muted-foreground hover:text-destructive',
            !sidebarOpen && 'justify-center px-2',
          )}
          onClick={handleLogout}
          title={!sidebarOpen ? 'Cerrar Sesión' : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {sidebarOpen && <span>Cerrar Sesión</span>}
        </Button>
      </div>
    </aside>
  );
}
