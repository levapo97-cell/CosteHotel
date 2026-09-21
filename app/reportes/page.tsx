'use client';

import { ComingSoon } from '@/components/Layout/ComingSoon';

export default function ReportesPage() {
  return (
    <ComingSoon
      title="Reportes"
      description="Reportes consolidados del hotel."
      features={[
        'Análisis de ingresos y ocupación',
        'Comparar costos entre hoteles',
      ]}
    />
  );
}
