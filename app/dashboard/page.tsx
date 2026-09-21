'use client';

import { CalendarDays, Check } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { ProtectedPage } from '@/components/Layout/ProtectedPage';
import { PageHeader } from '@/components/Layout/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Card, CardTitle, KpiCard, KpiGrid } from '@/components/ui/Card';

const ROLE_LABELS = { admin: 'Administrador', chef: 'Chef', manager: 'Gerente' };

const UPCOMING_EVENTS = [
  { name: 'Boda García - Día 1', detail: 'Mañana 10:00 · 150 personas' },
  { name: 'Reunión Corporativa ABC', detail: '22 sept · 10:00 · 45 personas' },
  { name: 'Quinceañera López', detail: '24 sept · 14:00 · 120 personas' },
];

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);

  return (
    <ProtectedPage>
      {user && (
        <>
          <PageHeader title={`Bienvenido, ${user.name}`} description={`Rol: ${ROLE_LABELS[user.role]}`} />

          <div className="space-y-8">
            <KpiGrid>
              <KpiCard label="Eventos activos" value="12" note="+2 esta semana" />
              <KpiCard label="Reservas pendientes" value="28" note="5 en las próximas 24 h" />
              <KpiCard label="Ingresos totales" value="$12,450" note="+12% vs. mes pasado" />
              <KpiCard label="Tasa de ocupación" value="85%" note="Operativo" />
            </KpiGrid>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-4">
              <Card className="p-6">
                <CardTitle>Eventos próximos</CardTitle>
                <ul className="mt-4 divide-y divide-line">
                  {UPCOMING_EVENTS.map((event) => (
                    <li key={event.name} className="flex items-start gap-3 py-3">
                      <CalendarDays size={18} className="mt-0.5 shrink-0 text-accent-text" />
                      <div className="min-w-0">
                        <p className="font-medium text-ink">{event.name}</p>
                        <p className="text-[13px] text-muted">{event.detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-6">
                <CardTitle>Perfil</CardTitle>
                <dl className="mt-4 space-y-4">
                  <div>
                    <dt className="text-[11px] font-semibold tracking-wide text-muted uppercase">Nombre</dt>
                    <dd className="mt-1 font-medium text-ink">{user.name}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold tracking-wide text-muted uppercase">Email</dt>
                    <dd className="mt-1 font-medium break-all text-ink">{user.email}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold tracking-wide text-muted uppercase">Rol</dt>
                    <dd className="mt-1">
                      <Badge tone="gold">{ROLE_LABELS[user.role]}</Badge>
                    </dd>
                  </div>
                </dl>
              </Card>
            </div>

            <Card className="p-6">
              <CardTitle>Para comenzar</CardTitle>
              <ul className="mt-4 space-y-2">
                {[
                  'Usa el menú lateral para entrar a las secciones de tu rol.',
                  'Arriba eliges el hotel y el área (restaurante o bar) con la que trabajas.',
                  'Para cambiar de rol, cierra sesión y elige otro usuario.',
                ].map((tip) => (
                  <li key={tip} className="flex gap-2 text-ink">
                    <Check size={16} className="mt-0.5 shrink-0 text-ok" />
                    {tip}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </>
      )}
    </ProtectedPage>
  );
}
