'use client';

import { ComingSoon } from '@/components/Layout/ComingSoon';

export default function ReservasPage() {
  return (
    <ComingSoon
      title="Reservas"
      description="Gestiona las reservas de mesas del restaurante."
      features={[
        'Crear y gestionar reservas de mesas en fechas específicas',
        'Ver la ocupación por turno',
      ]}
    />
  );
}
