'use client';

import { MainLayout } from '@/components/Layout/MainLayout';
import { PageHeader } from '@/components/Layout/PageHeader';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function EventosPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push('/');
  }, [user, router]);

  if (!user) return null;

  return (
    <MainLayout>
      <PageHeader title="Eventos" description="Gestiona los eventos del restaurante" />
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-slate-600">Este módulo permitirá crear y gestionar eventos de múltiples días.</p>
        <div className="mt-4 p-4 bg-slate-50 rounded">
          <p className="text-sm text-slate-600">📋 Funcionalidades previstas:</p>
          <ul className="text-sm text-slate-600 list-disc list-inside mt-2 space-y-1">
            <li>Crear eventos de múltiples días</li>
            <li>Organizar servicios por día (desayuno, almuerzo, cena, cocktail)</li>
            <li>Asignar platos a cada servicio</li>
            <li>Cálculo automático de costos totales</li>
          </ul>
        </div>
      </div>
    </MainLayout>
  );
}
