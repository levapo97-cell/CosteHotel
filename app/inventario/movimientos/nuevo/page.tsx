'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProtectedPage } from '@/components/Layout/ProtectedPage';
import { FormScreen } from '@/components/ui/FormScreen';
import { MovementForm } from '@/components/Inventario/MovementForm';
import { useInventoryStore } from '@/store/inventoryStore';
import { useAuthStore } from '@/store/authStore';
import { useWorkspaceData } from '@/components/Workspace/useWorkspaceData';
import { AREA_COPY } from '@/lib/inventory';

const FORM_ID = 'movement-form';

function NewMovementForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialProductId = searchParams.get('producto') ?? undefined;
  const { products, area } = useWorkspaceData();
  const registerMovement = useInventoryStore((state) => state.registerMovement);
  const userName = useAuthStore((state) => state.user?.name ?? '');

  return (
    <FormScreen
      title="Registrar movimiento"
      description={`${AREA_COPY[area].label} · compras, consumos, mermas y ajustes del stock.`}
      backHref="/inventario"
      formId={FORM_ID}
      submitLabel="Registrar"
    >
      <MovementForm
        formId={FORM_ID}
        products={products}
        initialProductId={initialProductId}
        onSubmit={(input) => {
          registerMovement(input, userName);
          router.push('/inventario');
        }}
      />
    </FormScreen>
  );
}

export default function NewMovementPage() {
  return (
    <ProtectedPage>
      <Suspense>
        <NewMovementForm />
      </Suspense>
    </ProtectedPage>
  );
}
