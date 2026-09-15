'use client';

import { MainLayout } from '@/components/Layout/MainLayout';
import { PageHeader } from '@/components/Layout/PageHeader';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Event {
  id: number;
  name: string;
  date: string;
  time: string;
  guests: number;
  cost: number;
  status: 'active' | 'completed' | 'cancelled';
  services: number;
  paid: boolean;
}

export default function EventosPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    if (!user) router.push('/');
  }, [user, router]);

  const allEvents: Event[] = [
    { id: 1, name: 'Boda García', date: 'Sept 22', time: '10:00 AM', guests: 150, cost: 5240, status: 'active', services: 3, paid: true },
    { id: 2, name: 'Reunión Corporativa ABC', date: 'Sept 24', time: '02:00 PM', guests: 45, cost: 2100, status: 'active', services: 1, paid: true },
    { id: 3, name: 'Quinceañera López', date: 'Sept 26', time: '06:00 PM', guests: 120, cost: 4800, status: 'active', services: 2, paid: false },
    { id: 4, name: 'Conferencia Tech Summit', date: 'Sept 18', time: '08:00 AM', guests: 200, cost: 8500, status: 'completed', services: 3, paid: true },
    { id: 5, name: 'Cena Gala Hotel Palace', date: 'Sept 15', time: '07:30 PM', guests: 180, cost: 7200, status: 'completed', services: 2, paid: true },
    { id: 6, name: 'Evento Cancelado XYZ', date: 'Sept 10', time: '05:00 PM', guests: 0, cost: 0, status: 'cancelled', services: 0, paid: false },
  ];

  const filteredEvents = allEvents.filter(event => {
    if (filter === 'active') return event.status === 'active';
    if (filter === 'completed') return event.status === 'completed';
    return true;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    const labels: Record<string, string> = {
      active: 'Activo',
      completed: 'Completado',
      cancelled: 'Cancelado',
    };
    return { style: styles[status], label: labels[status] };
  };

  if (!user) return null;

  return (
    <MainLayout>
      <PageHeader
        title="Eventos"
        description="Gestiona todos tus eventos y servicios"
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Eventos Totales</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">12</p>
          <p className="text-sm text-gray-600 mt-1">3 activos</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ingresos</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">$62.8K</p>
          <p className="text-sm text-green-600 mt-1">+8% este mes</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Personas</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">895</p>
          <p className="text-sm text-gray-600 mt-1">Atendidas</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Servicios</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">28</p>
          <p className="text-sm text-gray-600 mt-1">Total</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Historial de Eventos</h2>
          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            + Nuevo Evento
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 pb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Todos ({allEvents.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === 'active'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Activos ({allEvents.filter(e => e.status === 'active').length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === 'completed'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Completados ({allEvents.filter(e => e.status === 'completed').length})
          </button>
        </div>

        {/* Lista de eventos */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">Evento</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">Fecha</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">Personas</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">Ingresos</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">Estado</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">Pago</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => {
                  const statusBadge = getStatusBadge(event.status);
                  return (
                    <tr key={event.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{event.name}</p>
                          <p className="text-xs text-gray-500">{event.services} servicios</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        <div>
                          <p className="font-medium text-gray-900">{event.date}</p>
                          <p className="text-xs text-gray-500">{event.time}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">{event.guests}</td>
                      <td className="py-4 px-4 text-sm font-medium text-gray-900">${event.cost.toLocaleString()}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${statusBadge.style}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                          event.paid
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {event.paid ? 'Pagado' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                          Ver
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No hay eventos en esta categoría
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
