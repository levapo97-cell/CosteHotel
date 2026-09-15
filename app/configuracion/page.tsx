'use client';

import { MainLayout } from '@/components/Layout/MainLayout';
import { PageHeader } from '@/components/Layout/PageHeader';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ConfiguraciónPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push('/');
  }, [user, router]);

  if (!user) return null;

  return (
    <MainLayout>
      <PageHeader title="Configuración" description="Configura la aplicación" />
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-slate-600">Rol actual: <span className="font-semibold capitalize">{user.role}</span></p>
        <div className="mt-4 p-4 bg-slate-50 rounded">
          <p className="text-sm text-slate-600">📋 Funcionalidades previstas:</p>
          <ul className="text-sm text-slate-600 list-disc list-inside mt-2 space-y-1">
            <li>Ajusta los parámetros del sistema</li>
          </ul>
        </div>
      </div>
    </MainLayout>
  );
}
