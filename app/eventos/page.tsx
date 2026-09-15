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
      <PageHeader
        title="Eventos"
        description="Gestiona los eventos del restaurante y sus servicios"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Eventos Activos</h2>
              <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                + Nuevo Evento
              </button>
            </div>

            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                    🎉
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900">Evento de Prueba {i}</h3>
                    <p className="text-sm text-gray-600">3 servicios • 150 personas • $5,240</p>
                    <div className="mt-2 flex gap-2">
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">Confirmado</span>
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">Pagado</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-gray-900">Sept 22</p>
                    <p className="text-xs text-gray-600">10:00 AM</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h2>
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Total de Eventos</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">12</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Ingresos Generados</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">$62,800</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Personas Atendidas</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">450+</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
