'use client';

import { MainLayout } from '@/components/Layout/MainLayout';
import { PageHeader } from '@/components/Layout/PageHeader';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function InventarioPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push('/');
  }, [user, router]);

  if (!user) return null;

  return (
    <MainLayout>
      <PageHeader title="Inventario" description="Gestiona el inventario de ingredientes" />
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-slate-600">Rol actual: <span className="font-semibold capitalize">{user.role}</span></p>
        <div className="mt-4 p-4 bg-slate-50 rounded">
          <p className="text-sm text-slate-600">📋 Funcionalidades previstas:</p>
          <ul className="text-sm text-slate-600 list-disc list-inside mt-2 space-y-1">
            <li>Control de precios y cantidades de ingredientes</li>
          </ul>
        </div>
      </div>
    </MainLayout>
  );
}
