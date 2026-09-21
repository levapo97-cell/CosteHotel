'use client';

import { ComingSoon } from '@/components/Layout/ComingSoon';

export default function PagosPage() {
  return (
    <ComingSoon
      title="Pagos"
      description="Gestiona los pagos de eventos y reservas."
      features={[
        'Procesar pagos y ver el historial de transacciones',
        'Confirmar pagos por QR',
      ]}
    />
  );
}
