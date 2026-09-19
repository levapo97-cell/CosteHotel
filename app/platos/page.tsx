'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/Layout/MainLayout';
import { PageHeader } from '@/components/Layout/PageHeader';
import { WorkspaceSwitcher } from '@/components/Workspace/WorkspaceSwitcher';
import { useAuthStore } from '@/store/authStore';
import { DishesView } from '@/components/Platos/DishesView';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { AREA_COPY } from '@/lib/inventory';

export default function PlatosPage() {
  const area = useWorkspaceStore((state) => state.area);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push('/');
  }, [user, router]);

  if (!user) return null;

  return (
    <MainLayout>
      <PageHeader
        title={AREA_COPY[area].recipes}
        description="Recetas con sus productos y cantidades. El costo se actualiza con cada compra."
        actions={<WorkspaceSwitcher />}
      />
      <DishesView />
    </MainLayout>
  );
}
