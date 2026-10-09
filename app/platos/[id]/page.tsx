'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedPage } from '@/components/Layout/ProtectedPage';
import { FormScreen } from '@/components/ui/FormScreen';
import { DishForm } from '@/components/Platos/DishForm';
import { useInventoryStore } from '@/store/inventoryStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useWorkspaceData } from '@/components/Workspace/useWorkspaceData';
import { buttonClass } from '@/components/ui/Button';

const FORM_ID = 'dish-form';

export default function EditDishPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { products, recipeCatalog, copy } = useWorkspaceData();
  const { hotelId, area } = useWorkspaceStore();
  const dish = useInventoryStore((state) => state.dishes.find((d) => d.id === id));
  const saveDish = useInventoryStore((state) => state.saveDish);

  return (
    <ProtectedPage>
      {dish ? (
        <FormScreen
          title={`Editar ${copy.recipe.toLowerCase()}`}
          description={`${copy.label} · merma, subrecetas, empaque, IVA y canales para calcular el coste y la rentabilidad.`}
          backHref="/platos"
          formId={FORM_ID}
          submitLabel="Guardar cambios"
        >
          <DishForm
            formId={FORM_ID}
            initial={dish}
            ingredients={products}
            recipes={recipeCatalog}
            area={area}
            onSubmit={(input) => {
              saveDish({ ...input, hotelId, area }, dish.id);
              router.push('/platos');
            }}
          />
        </FormScreen>
      ) : (
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-muted">Esta receta no existe o cambió de área.</p>
          <Link href="/platos" className={buttonClass('outline', 'mt-4')}>
            Volver a Platos
          </Link>
        </div>
      )}
    </ProtectedPage>
  );
}
