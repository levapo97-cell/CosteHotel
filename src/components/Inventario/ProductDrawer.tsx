'use client';

import { Ingredient } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { AREA_COPY } from '@/lib/inventory';
import { Drawer, DrawerActions } from '@/components/ui/Drawer';
import { DrawerControl } from '@/components/ui/useDrawerState';
import { ProductForm } from './ProductForm';
import { MovementForm } from './MovementForm';

export type ProductDrawerPayload = { kind: 'product'; product?: Ingredient } | { kind: 'movement'; product?: Ingredient };

const FORM_ID = 'product-drawer-form';

// Panel para crear/editar productos y registrar movimientos del área activa.
export function ProductDrawer({ drawer, products }: { drawer: DrawerControl<ProductDrawerPayload>; products: Ingredient[] }) {
  const userName = useAuthStore((state) => state.user?.name ?? '');
  const { hotelId, area } = useWorkspaceStore();
  const { addProduct, updateProduct, registerMovement } = useInventoryStore();

  const payload = drawer.payload ?? { kind: 'product' };
  const editing = payload.kind === 'product' ? payload.product : undefined;
  const title = payload.kind === 'movement' ? 'Registrar movimiento' : editing ? 'Editar producto' : 'Nuevo producto';
  const submitLabel = payload.kind === 'movement' ? 'Registrar' : editing ? 'Guardar cambios' : 'Guardar';

  return (
    <Drawer
      open={drawer.open}
      onClose={drawer.close}
      title={title}
      description={`${AREA_COPY[area].label} · el stock de cada área se maneja por separado.`}
      footer={<DrawerActions formId={FORM_ID} submitLabel={submitLabel} onCancel={drawer.close} />}
    >
      {payload.kind === 'movement' ? (
        <MovementForm
          key={drawer.session}
          formId={FORM_ID}
          products={products}
          initialProductId={payload.product?.id}
          onSubmit={(input) => {
            registerMovement(input, userName);
            drawer.close();
          }}
        />
      ) : (
        <ProductForm
          key={drawer.session}
          formId={FORM_ID}
          initial={editing}
          onSubmit={(values) => {
            if (editing) updateProduct(editing.id, { name: values.name, minStock: values.minStock });
            else addProduct({ ...values, hotelId, area }, userName);
            drawer.close();
          }}
        />
      )}
    </Drawer>
  );
}
