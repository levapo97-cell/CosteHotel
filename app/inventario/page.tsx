'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/Layout/MainLayout';
import { PageHeader } from '@/components/Layout/PageHeader';
import { WorkspaceSwitcher } from '@/components/Workspace/WorkspaceSwitcher';
import { useAuthStore } from '@/store/authStore';
import { InventoryView } from '@/components/Inventario/InventoryView';

export default function InventarioPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push('/');
  }, [user, router]);

  if (!user) return null;

  return (
    <MainLayout>
      <PageHeader
        title="Inventario"
        description="Stock, compras y mermas de cada área. Restaurante y bar se manejan por separado."
        actions={<WorkspaceSwitcher />}
      />
      <InventoryView />
    </MainLayout>
  );
}
