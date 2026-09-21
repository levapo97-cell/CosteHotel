'use client';

import { Dish, Ingredient } from '@/types';
import { useInventoryStore } from '@/store/inventoryStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { AREA_COPY } from '@/lib/inventory';
import { Drawer, DrawerActions } from '@/components/ui/Drawer';
import { DrawerControl } from '@/components/ui/useDrawerState';
import { DishForm } from './DishForm';

const FORM_ID = 'dish-drawer-form';

export function DishDrawer({ drawer, products }: { drawer: DrawerControl<Dish>; products: Ingredient[] }) {
  const { hotelId, area } = useWorkspaceStore();
  const saveDish = useInventoryStore((state) => state.saveDish);
  const copy = AREA_COPY[area];
  const editing = drawer.payload;

  return (
    <Drawer
      open={drawer.open}
      onClose={drawer.close}
      title={editing ? `Editar ${copy.recipe.toLowerCase()}` : copy.newTitle}
      description={`${copy.label} · el costo usa el costo promedio de los productos de esta área.`}
      footer={<DrawerActions formId={FORM_ID} submitLabel={editing ? 'Guardar cambios' : 'Guardar'} onCancel={drawer.close} />}
    >
      <DishForm
        key={drawer.session}
        formId={FORM_ID}
        initial={editing}
        ingredients={products}
        area={area}
        onSubmit={(input) => {
          saveDish({ ...input, hotelId, area }, editing?.id);
          drawer.close();
        }}
      />
    </Drawer>
  );
}
