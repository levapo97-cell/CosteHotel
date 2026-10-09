'use client';

import { useRouter } from 'next/navigation';
import { ProtectedPage } from '@/components/Layout/ProtectedPage';
import { FormScreen } from '@/components/ui/FormScreen';
import { DishForm } from '@/components/Platos/DishForm';
import { useInventoryStore } from '@/store/inventoryStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useWorkspaceData } from '@/components/Workspace/useWorkspaceData';

const FORM_ID = 'dish-form';

export default function NewDishPage() {
  const router = useRouter();
  const { products, recipeCatalog, copy } = useWorkspaceData();
  const { hotelId, area } = useWorkspaceStore();
  const saveDish = useInventoryStore((state) => state.saveDish);

  return (
    <ProtectedPage>
      <FormScreen
        title={copy.newTitle}
        description={`${copy.label} · merma, subrecetas, empaque, IVA y canales para calcular el coste y la rentabilidad.`}
        backHref="/platos"
        formId={FORM_ID}
        submitLabel="Guardar"
      >
        <DishForm
          formId={FORM_ID}
          ingredients={products}
          recipes={recipeCatalog}
          area={area}
          onSubmit={(input) => {
            saveDish({ ...input, hotelId, area });
            router.push('/platos');
          }}
        />
      </FormScreen>
    </ProtectedPage>
  );
}
