'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth.store';
import { Rol } from '@/types/enums';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user, isHydrated } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (user?.requiereCambioPassword) {
      router.replace('/cambiar-password');
      return;
    }

    if (user?.rol === Rol.ADMIN) {
      router.replace('/dashboard');
    } else {
      router.replace('/inicio');
    }
  }, [isAuthenticated, user, isHydrated, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}
