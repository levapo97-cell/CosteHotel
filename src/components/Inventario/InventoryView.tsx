'use client';

import { useState } from 'react';
import { ArrowLeftRight, History, Plus, Search, Warehouse } from 'lucide-react';
import { Ingredient, MovementType } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { formatMoney } from '@/lib/costing';
import { AREA_COPY, MOVEMENT_TYPES, isLowStock } from '@/lib/inventory';
import { Drawer } from '@/components/ui/Drawer';
import { Select, StatBox, inputClass } from '@/components/ui/Form';
import { ProductForm } from './ProductForm';
import { MovementForm } from './MovementForm';
import { StockTable } from './StockTable';
import { MovementsTable } from './MovementsTable';

const FORM_ID = 'inventory-form';
const TABS = [
  { id: 'stock', label: 'Stock', Icon: Warehouse },
  { id: 'movements', label: 'Movimientos', Icon: History },
] as const;

// `session` remonta el formulario en cada apertura; `kind` y `product` se conservan al
// cerrar para que el panel no cambie de contenido durante la animación de salida.
interface DrawerState {
  open: boolean;
  kind: 'product' | 'movement';
  product?: Ingredient;
  session: number;
}

export function InventoryView() {
  const userName = useAuthStore((state) => state.user?.name ?? '');
  const { hotelId, area } = useWorkspaceStore();
  const { ingredients, movements, dishes, addProduct, updateProduct, deleteProduct, registerMovement } =
    useInventoryStore();

  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('stock');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<MovementType | ''>('');
  const [productFilter, setProductFilter] = useState('');
  const [drawer, setDrawer] = useState<DrawerState>({ open: false, kind: 'product', session: 0 });

  const openDrawer = (kind: DrawerState['kind'], product?: Ingredient) =>
    setDrawer((current) => ({ open: true, kind, product, session: current.session + 1 }));
  const closeDrawer = () => setDrawer((current) => ({ ...current, open: false }));

  const products = ingredients.filter((ing) => ing.hotelId === hotelId && ing.area === area);
  const productsById = new Map(products.map((p) => [p.id, p]));
  const areaDishes = dishes.filter((dish) => dish.hotelId === hotelId && dish.area === area);
  const usageCount = (id: string) =>
    areaDishes.filter((dish) => dish.ingredients.some((item) => item.ingredientId === id)).length;

  // Al cambiar de hotel o área, un filtro de producto de otra área deja de aplicar.
  const activeProductFilter = productsById.has(productFilter) ? productFilter : '';
  const query = search.trim().toLowerCase();
  const visibleProducts = products
    .filter((p) => p.name.toLowerCase().includes(query))
    .sort((a, b) => Number(isLowStock(b)) - Number(isLowStock(a)) || a.name.localeCompare(b.name));
  const visibleMovements = movements.filter(
    (mov) =>
      productsById.has(mov.ingredientId) &&
      (!typeFilter || mov.type === typeFilter) &&
      (!activeProductFilter || mov.ingredientId === activeProductFilter)
  );

  const inventoryValue = products.reduce((sum, p) => sum + p.costPerUnit * p.currentStock, 0);
  const lowCount = products.filter(isLowStock).length;

  const handleDelete = (product: Ingredient) => {
    if (window.confirm(`¿Eliminar "${product.name}" y su historial de movimientos?`)) deleteProduct(product.id);
  };

  const isProductDrawer = drawer.kind === 'product';
  const drawerTitle = isProductDrawer
    ? drawer.product
      ? 'Editar producto'
      : 'Nuevo producto'
    : 'Registrar movimiento';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatBox tone="blue" label="Productos" value={products.length} hint={AREA_COPY[area].label} />
        <StatBox tone="green" label="Valor del inventario" value={formatMoney(inventoryValue)} />
        <StatBox
          tone={lowCount > 0 ? 'red' : 'purple'}
          label="Bajo stock mínimo"
          value={lowCount}
          hint={lowCount > 0 ? 'Revisa y programa compras' : 'Todo en orden'}
        />
      </div>

      <div className="rounded-lg bg-white shadow">
        <div className="flex border-b border-gray-200">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex flex-1 items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
                tab === id ? 'border-b-2 border-blue-600 bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-4 p-6">
          <div className="flex flex-wrap items-center gap-3">
            {tab === 'stock' ? (
              <div className="relative w-full max-w-xs">
                <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar producto"
                  aria-label="Buscar producto"
                  className={`${inputClass()} pl-9`}
                />
              </div>
            ) : (
              <>
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as MovementType | '')}
                  aria-label="Filtrar por tipo"
                  className="w-44"
                >
                  <option value="">Todos los tipos</option>
                  {(Object.keys(MOVEMENT_TYPES) as MovementType[]).map((type) => (
                    <option key={type} value={type}>
                      {MOVEMENT_TYPES[type].label}
                    </option>
                  ))}
                </Select>
                <Select
                  value={activeProductFilter}
                  onChange={(e) => setProductFilter(e.target.value)}
                  aria-label="Filtrar por producto"
                  className="w-56"
                >
                  <option value="">Todos los productos</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </>
            )}

            <div className="ml-auto flex gap-2">
              <button
                onClick={() => openDrawer('movement')}
                disabled={products.length === 0}
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
              >
                <ArrowLeftRight size={16} />
                Registrar movimiento
              </button>
              <button
                onClick={() => openDrawer('product')}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                <Plus size={16} />
                Nuevo producto
              </button>
            </div>
          </div>

          {tab === 'stock' ? (
            <StockTable
              products={visibleProducts}
              usageCount={usageCount}
              onMove={(product) => openDrawer('movement', product)}
              onEdit={(product) => openDrawer('product', product)}
              onDelete={handleDelete}
            />
          ) : (
            <MovementsTable movements={visibleMovements} productsById={productsById} />
          )}
        </div>
      </div>

      <Drawer
        open={drawer.open}
        onClose={closeDrawer}
        title={drawerTitle}
        description={`${AREA_COPY[area].label} · el stock de cada área se maneja por separado.`}
        footer={
          <>
            <button
              type="button"
              onClick={closeDrawer}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form={FORM_ID}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              {isProductDrawer ? (drawer.product ? 'Guardar cambios' : 'Agregar producto') : 'Registrar'}
            </button>
          </>
        }
      >
        {isProductDrawer ? (
          <ProductForm
            key={drawer.session}
            formId={FORM_ID}
            initial={drawer.product}
            onSubmit={(values) => {
              if (drawer.product) {
                updateProduct(drawer.product.id, { name: values.name, minStock: values.minStock });
              } else {
                addProduct({ ...values, hotelId, area }, userName);
              }
              closeDrawer();
            }}
          />
        ) : (
          <MovementForm
            key={drawer.session}
            formId={FORM_ID}
            products={products}
            initialProductId={drawer.product?.id}
            onSubmit={(input) => {
              registerMovement(input, userName);
              closeDrawer();
            }}
          />
        )}
      </Drawer>
    </div>
  );
}
