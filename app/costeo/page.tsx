'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/Layout/MainLayout';
import { PageHeader } from '@/components/Layout/PageHeader';
import { WorkspaceSwitcher } from '@/components/Workspace/WorkspaceSwitcher';
import { useAuthStore } from '@/store/authStore';
import { ReportsTab } from '@/components/Costeo/ReportsTab';

export default function CosteoPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push('/');
  }, [user, router]);

  if (!user) return null;

  return (
    <MainLayout>
      <PageHeader
        title="Costeo"
        description="Rentabilidad de platos y bebidas según el costo real de los productos."
        actions={<WorkspaceSwitcher />}
      />
      <ReportsTab />
    </MainLayout>
  );
}
