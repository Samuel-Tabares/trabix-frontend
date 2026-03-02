'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TiposInsumoRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/stock/tipos-insumo');
  }, [router]);
  return null;
}
