'use client';

import { useRouter } from 'next/navigation';
import { ProtectedPage } from '@/components/Layout/ProtectedPage';
import { FormScreen } from '@/components/ui/FormScreen';
import { ProductForm } from '@/components/Inventario/ProductForm';
import { useInventoryStore } from '@/store/inventoryStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useAuthStore } from '@/store/authStore';
import { AREA_COPY } from '@/lib/inventory';

const FORM_ID = 'product-form';

export default function NewProductPage() {
  const router = useRouter();
  const addProduct = useInventoryStore((state) => state.addProduct);
  const { hotelId, area } = useWorkspaceStore();
  const userName = useAuthStore((state) => state.user?.name ?? '');

  return (
    <ProtectedPage>
      <FormScreen
        title="Nuevo producto"
        description={`${AREA_COPY[area].label} · el stock de cada área se maneja por separado.`}
        backHref="/inventario"
        formId={FORM_ID}
        submitLabel="Guardar"
      >
        <ProductForm
          formId={FORM_ID}
          onSubmit={(values) => {
            addProduct(
              {
                ...values,
                hotelId,
                area,
                category: values.category || undefined,
                supplier: values.supplier || undefined,
              },
              userName
            );
            router.push('/inventario');
          }}
        />
      </FormScreen>
    </ProtectedPage>
  );
}
