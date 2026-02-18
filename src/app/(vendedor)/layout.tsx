import { VendedorHeader } from '@/components/layout/vendedor-header';
import { VendedorBottomNav } from '@/components/layout/vendedor-bottom-nav';

export default function VendedorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-16">
      <VendedorHeader />
      <main className="p-4">{children}</main>
      <VendedorBottomNav />
    </div>
  );
}
