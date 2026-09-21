'use client';

import { ComingSoon } from '@/components/Layout/ComingSoon';

export default function UsuariosPage() {
  return (
    <ComingSoon
      title="Usuarios"
      description="Gestiona los usuarios del sistema."
      features={[
        'Crear usuarios y asignar roles y permisos',
        'Asignar cada usuario a un hotel y un área',
      ]}
    />
  );
}
