'use client';

import { useAuthStore } from '@/store/authStore';
import { MainLayout } from '@/components/Layout/MainLayout';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Bienvenido, {user.name}</h1>
          <p className="text-slate-600 mt-2">Dashboard - {user.role.toUpperCase()}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-slate-600 text-sm font-semibold">Eventos</h3>
            <p className="text-3xl font-bold text-slate-900 mt-2">12</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-slate-600 text-sm font-semibold">Reservas</h3>
            <p className="text-3xl font-bold text-slate-900 mt-2">28</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-slate-600 text-sm font-semibold">Pagos</h3>
            <p className="text-3xl font-bold text-slate-900 mt-2">$5,420</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-slate-600 text-sm font-semibold">Ocupación</h3>
            <p className="text-3xl font-bold text-slate-900 mt-2">85%</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Información del Usuario</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-slate-500">Nombre</p>
              <p className="text-slate-900 font-medium">{user.name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Email</p>
              <p className="text-slate-900 font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Rol</p>
              <p className="text-slate-900 font-medium capitalize">{user.role}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Próximos pasos</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Explora el menú lateral para ver las opciones disponibles para tu rol</li>
            <li>Cada rol tiene acceso a diferentes módulos</li>
            <li>Vuelve a la página de inicio para cambiar de rol</li>
          </ul>
        </div>
      </div>
    </MainLayout>
  );
}
