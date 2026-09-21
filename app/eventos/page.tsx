'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ProtectedPage } from '@/components/Layout/ProtectedPage';
import { PageHeader } from '@/components/Layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, KpiCard, KpiGrid } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';

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

type Filter = 'all' | 'active' | 'completed';

const ALL_EVENTS: Event[] = [
  { id: 1, name: 'Boda García', date: 'Sept 22', time: '10:00 AM', guests: 150, cost: 5240, status: 'active', services: 3, paid: true },
  { id: 2, name: 'Reunión Corporativa ABC', date: 'Sept 24', time: '02:00 PM', guests: 45, cost: 2100, status: 'active', services: 1, paid: true },
  { id: 3, name: 'Quinceañera López', date: 'Sept 26', time: '06:00 PM', guests: 120, cost: 4800, status: 'active', services: 2, paid: false },
  { id: 4, name: 'Conferencia Tech Summit', date: 'Sept 18', time: '08:00 AM', guests: 200, cost: 8500, status: 'completed', services: 3, paid: true },
  { id: 5, name: 'Cena Gala Hotel Palace', date: 'Sept 15', time: '07:30 PM', guests: 180, cost: 7200, status: 'completed', services: 2, paid: true },
  { id: 6, name: 'Evento Cancelado XYZ', date: 'Sept 10', time: '05:00 PM', guests: 0, cost: 0, status: 'cancelled', services: 0, paid: false },
];

const STATUS = {
  active: { label: 'Activo', tone: 'gold' },
  completed: { label: 'Completado', tone: 'ok' },
  cancelled: { label: 'Cancelado', tone: 'bad' },
} as const;

const GRID =
  'grid min-w-[760px] grid-cols-[minmax(200px,2fr)_minmax(110px,1fr)_minmax(80px,0.7fr)_minmax(100px,0.9fr)_minmax(110px,0.9fr)_minmax(100px,0.9fr)_minmax(64px,auto)] items-center gap-x-4 px-5';

export default function EventosPage() {
  const [filter, setFilter] = useState<Filter>('all');

  const filteredEvents = ALL_EVENTS.filter((event) => filter === 'all' || event.status === filter);

  return (
    <ProtectedPage>
      <PageHeader
        title="Eventos"
        description="Gestiona todos tus eventos y servicios."
        action={
          <Button>
            <Plus size={18} />
            Nuevo evento
          </Button>
        }
      />

      <div className="space-y-8">
        <KpiGrid>
          <KpiCard label="Eventos totales" value="12" note="3 activos" />
          <KpiCard label="Ingresos" value="$62.8K" note="+8% este mes" />
          <KpiCard label="Personas" value="895" note="Atendidas" />
          <KpiCard label="Servicios" value="28" note="Total" />
        </KpiGrid>

        <div className="space-y-6">
          <Tabs<Filter>
            label="Filtrar eventos"
            value={filter}
            onChange={setFilter}
            tabs={[
              { value: 'all', label: 'Todos', count: ALL_EVENTS.length },
              { value: 'active', label: 'Activos', count: ALL_EVENTS.filter((e) => e.status === 'active').length },
              { value: 'completed', label: 'Completados', count: ALL_EVENTS.filter((e) => e.status === 'completed').length },
            ]}
          />

          <Card className="overflow-x-auto">
            <div role="table" aria-label="Historial de eventos">
              <div
                role="row"
                className={`${GRID} border-b border-line bg-surface py-3 text-xs font-semibold tracking-wide text-muted uppercase`}
              >
                <div role="columnheader">Evento</div>
                <div role="columnheader">Fecha</div>
                <div role="columnheader" className="text-right">Personas</div>
                <div role="columnheader" className="text-right">Ingresos</div>
                <div role="columnheader">Estado</div>
                <div role="columnheader">Pago</div>
                <div role="columnheader" className="text-right">Acción</div>
              </div>

              {filteredEvents.map((event) => (
                <div role="row" key={event.id} className={`${GRID} border-b border-line py-4 last:border-b-0`}>
                  <div role="cell" className="min-w-0">
                    <p className="truncate font-medium text-ink">{event.name}</p>
                    <p className="text-[11px] text-muted">{event.services} servicios</p>
                  </div>
                  <div role="cell">
                    <p className="font-medium text-ink">{event.date}</p>
                    <p className="text-[11px] text-muted">{event.time}</p>
                  </div>
                  <div role="cell" className="text-right text-ink">{event.guests}</div>
                  <div role="cell" className="text-right font-semibold text-ink">${event.cost.toLocaleString()}</div>
                  <div role="cell">
                    <Badge tone={STATUS[event.status].tone}>{STATUS[event.status].label}</Badge>
                  </div>
                  <div role="cell">
                    <Badge tone={event.paid ? 'ok' : 'warn'}>{event.paid ? 'Pagado' : 'Pendiente'}</Badge>
                  </div>
                  <div role="cell" className="text-right">
                    <button
                      type="button"
                      className="rounded-chip px-3 py-1.5 text-sm font-medium text-accent-text transition-colors hover:bg-accent/5"
                    >
                      Ver
                    </button>
                  </div>
                </div>
              ))}

              {filteredEvents.length === 0 && (
                <p role="row" className="px-5 py-12 text-center text-muted">
                  <span role="cell">No hay eventos en esta categoría.</span>
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </ProtectedPage>
  );
}
