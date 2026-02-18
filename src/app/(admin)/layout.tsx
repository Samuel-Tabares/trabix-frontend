'use client';

import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { AdminHeader } from '@/components/layout/admin-header';
import { useUIStore } from '@/lib/store/ui.store';
import { cn } from '@/lib/utils';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      {/* Mobile header */}
      <AdminHeader />

      {/* Mobile sidebar overlay */}
      <div className="md:hidden">
        <AdminSidebar />
      </div>

      <main
        className={cn(
          'transition-all duration-300 p-4 md:p-6',
          sidebarOpen ? 'md:ml-64' : 'md:ml-16',
        )}
      >
        {children}
      </main>
    </div>
  );
}
