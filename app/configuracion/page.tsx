'use client';

import { ComingSoon } from '@/components/Layout/ComingSoon';

export default function ConfiguracionPage() {
  return (
    <ComingSoon
      title="Configuración"
      description="Parámetros generales de la aplicación."
      features={[
        'Ajustar los parámetros del sistema',
        'Definir umbrales de margen y de stock',
      ]}
    />
  );
}
