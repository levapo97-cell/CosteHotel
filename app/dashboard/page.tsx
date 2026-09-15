'use client';

import { useAuthStore } from '@/store/authStore';
import { MainLayout } from '@/components/Layout/MainLayout';
import { PageHeader } from '@/components/Layout/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
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
        <PageHeader
          title={`Bienvenido, ${user.name}`}
          description={`Rol: ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}`}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Eventos Activos"
            value="12"
            subtext="+2 esta semana"
            icon="📅"
          />
          <StatCard
            label="Reservas Pendientes"
            value="28"
            subtext="5 próximas 24h"
            icon="🪑"
          />
          <StatCard
            label="Ingresos Totales"
            value="$12,450"
            subtext="+12% vs mes pasado"
            icon="💰"
          />
          <StatCard
            label="Tasa Ocupación"
            value="85%"
            subtext="Operativo"
            icon="📊"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Eventos Próximos</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-3 h-3 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">Boda García - Día 1</p>
                  <p className="text-sm text-gray-600">Mañana 10:00 AM • 150 personas</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-3 h-3 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">Reunión Corporativa ABC</p>
                  <p className="text-sm text-gray-600">22 Sept • 10:00 AM • 45 personas</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-3 h-3 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">Quinceañera López</p>
                  <p className="text-sm text-gray-600">24 Sept • 14:00 PM • 120 personas</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Perfil</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</p>
                <p className="text-gray-900 font-medium mt-1">{user.name}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</p>
                <p className="text-gray-900 font-medium mt-1">{user.email}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rol</p>
                <div className="mt-1 inline-block px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-200">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Comenzar</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>✓ Explora el menú lateral para acceder a todas las funciones disponibles para tu rol</li>
            <li>✓ Cada sección tiene herramientas específicas según tus permisos</li>
            <li>✓ Puedes cambiar de rol desde la página de inicio</li>
          </ul>
        </div>
      </div>
    </MainLayout>
  );
}
