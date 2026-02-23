'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function VendedorHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background px-4">
      <span className="text-lg font-bold">TRABIX</span>
      <Link href="/mis-notificaciones">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
      </Link>
    </header>
  );
}
