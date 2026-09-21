'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Dish, Ingredient } from '@/types';
import { useInventoryStore } from '@/store/inventoryStore';
import { formatMoney } from '@/lib/costing';
import { isLowStock } from '@/lib/inventory';
import { useWorkspaceData } from '@/components/Workspace/useWorkspaceData';
import { PageHeader } from '@/components/Layout/PageHeader';
import { ProductsTable } from '@/components/Inventario/ProductsTable';
import { ProductDrawer, ProductDrawerPayload } from '@/components/Inventario/ProductDrawer';
import { DishCards } from '@/components/Platos/DishCards';
import { DishDrawer } from '@/components/Platos/DishDrawer';
import { Button } from '@/components/ui/Button';
import { KpiCard, KpiGrid } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { formatPercent } from '@/components/ui/format';
import { marginTone } from '@/components/ui/tone';
import { useDrawerState } from '@/components/ui/useDrawerState';
import { ProfitabilityView } from './ProfitabilityView';

type Tab = 'products' | 'recipes' | 'profitability';

export function CosteoView() {
  const { copy, products, recipes, movements, usageCount } = useWorkspaceData();
  const { deleteProduct, deleteDish } = useInventoryStore();
  const [tab, setTab] = useState<Tab>('products');
  const productDrawer = useDrawerState<ProductDrawerPayload>();
  const dishDrawer = useDrawerState<Dish>();

  const inventoryValue = products.reduce((sum, p) => sum + p.costPerUnit * p.currentStock, 0);
  const lowCount = products.filter(isLowStock).length;
  const avgMargin = recipes.length
    ? recipes.reduce((sum, r) => sum + r.analysis.marginPercentage, 0) / recipes.length
    : 0;
  const unused = products.filter((p) => usageCount(p.id) === 0);
  const idleCapital = unused.reduce((sum, p) => sum + p.costPerUnit * p.currentStock, 0);

  const handleDeleteProduct = (product: Ingredient) => {
    if (window.confirm(`¿Eliminar "${product.name}" y su historial de movimientos?`)) deleteProduct(product.id);
  };
  const handleDeleteDish = (dish: Dish) => {
    if (window.confirm(`¿Eliminar "${dish.name}"?`)) deleteDish(dish.id);
  };

  const action =
    tab === 'products' ? (
      <Button onClick={() => productDrawer.show({ kind: 'product' })}>
        <Plus size={18} />
        Nuevo producto
      </Button>
    ) : tab === 'recipes' ? (
      <Button onClick={() => dishDrawer.show()} disabled={products.length === 0}>
        <Plus size={18} />
        {copy.newRecipe}
      </Button>
    ) : null;

  return (
    <>
      <PageHeader
        title="Costeo"
        description="Costo real de cada receta a partir del costo promedio ponderado de sus productos, y cuánto margen deja."
        action={action}
      />

      <div className="space-y-8">
        <KpiGrid>
          <KpiCard label="Valor del inventario" value={formatMoney(inventoryValue)} note={`${products.length} productos`} />
          <KpiCard
            label="Bajo mínimo"
            value={lowCount}
            tone={lowCount > 0 ? 'bad' : 'ok'}
            note={lowCount > 0 ? 'Conviene programar compras' : 'Todo el stock sobre el mínimo'}
          />
          <KpiCard
            label="Margen promedio"
            value={recipes.length ? formatPercent(avgMargin) : '—'}
            tone={recipes.length ? marginTone(avgMargin) : undefined}
            note={`${recipes.length} ${copy.recipes.toLowerCase()}`}
          />
          <KpiCard
            label="Sin usar en recetas"
            value={unused.length}
            note={`${formatMoney(idleCapital)} de capital inmovilizado`}
          />
        </KpiGrid>

        <div className="space-y-6">
          <Tabs<Tab>
            label="Secciones de costeo"
            value={tab}
            onChange={setTab}
            tabs={[
              { value: 'products', label: 'Productos', count: products.length },
              { value: 'recipes', label: copy.recipes, count: recipes.length },
              { value: 'profitability', label: 'Rentabilidad' },
            ]}
          />

          {tab === 'products' && (
            <ProductsTable
              products={products}
              movements={movements}
              usageCount={usageCount}
              onMove={(product) => productDrawer.show({ kind: 'movement', product })}
              onEdit={(product) => productDrawer.show({ kind: 'product', product })}
              onDelete={handleDeleteProduct}
            />
          )}
          {tab === 'recipes' && (
            <DishCards
              recipes={recipes}
              emptyText={`Aún no hay ${copy.recipes.toLowerCase()} en esta área.`}
              onEdit={(dish) => dishDrawer.show(dish)}
              onDelete={handleDeleteDish}
            />
          )}
          {tab === 'profitability' && <ProfitabilityView />}
        </div>
      </div>

      <ProductDrawer drawer={productDrawer} products={products} />
      <DishDrawer drawer={dishDrawer} products={products} />
    </>
  );
}
