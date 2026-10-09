'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedPage } from '@/components/Layout/ProtectedPage';
import { FormScreen } from '@/components/ui/FormScreen';
import { ProductForm } from '@/components/Inventario/ProductForm';
import { useInventoryStore } from '@/store/inventoryStore';
import { buttonClass } from '@/components/ui/Button';

const FORM_ID = 'product-form';

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const product = useInventoryStore((state) => state.ingredients.find((ing) => ing.id === id));
  const updateProduct = useInventoryStore((state) => state.updateProduct);
  const acceptReferenceCost = useInventoryStore((state) => state.acceptReferenceCost);

  return (
    <ProtectedPage>
      {product ? (
        <FormScreen
          title="Editar producto"
          description="Solo cambian el nombre y el mínimo: el costo lo mueven las compras y el stock los movimientos."
          backHref="/inventario"
          formId={FORM_ID}
          submitLabel="Guardar cambios"
        >
          <ProductForm
            formId={FORM_ID}
            initial={product}
            onAcceptReferenceCost={() => acceptReferenceCost(product.id)}
            onSubmit={(values) => {
              updateProduct(product.id, {
                name: values.name,
                minStock: values.minStock,
                allergens: values.allergens,
                category: values.category || undefined,
                supplier: values.supplier || undefined,
              });
              router.push('/inventario');
            }}
          />
        </FormScreen>
      ) : (
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-muted">Este producto no existe o cambió de área.</p>
          <Link href="/inventario" className={buttonClass('outline', 'mt-4')}>
            Volver a Inventario
          </Link>
        </div>
      )}
    </ProtectedPage>
  );
}
