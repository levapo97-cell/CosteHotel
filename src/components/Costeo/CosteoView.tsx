'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Dish, Ingredient } from '@/types';
import { useInventoryStore } from '@/store/inventoryStore';
import { formatMoney } from '@/lib/costing';
import { isLowStock } from '@/lib/inventory';
import { useWorkspaceData } from '@/components/Workspace/useWorkspaceData';
import { PageHeader } from '@/components/Layout/PageHeader';
import { ProductsTable } from '@/components/Inventario/ProductsTable';
import { DishCards } from '@/components/Platos/DishCards';
import { Button } from '@/components/ui/Button';
import { KpiCard, KpiGrid } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { formatPercent } from '@/components/ui/format';
import { marginTone } from '@/components/ui/tone';
import { AttentionPanel } from './AttentionPanel';
import { ProfitabilityView } from './ProfitabilityView';

type Tab = 'products' | 'recipes' | 'profitability';

export function CosteoView() {
  const router = useRouter();
  const { copy, products, recipes, recipeCatalog, movements, usageCount, hotelName } = useWorkspaceData();
  const { deleteProduct, deleteDish } = useInventoryStore();
  const [tab, setTab] = useState<Tab>('products');

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
      <Button onClick={() => router.push('/inventario/productos/nuevo')}>
        <Plus size={18} />
        Nuevo producto
      </Button>
    ) : tab === 'recipes' ? (
      <Button onClick={() => router.push('/platos/nuevo')} disabled={products.length === 0}>
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
        <AttentionPanel />

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
              onMove={(product) => router.push(`/inventario/movimientos/nuevo?producto=${product.id}`)}
              onEdit={(product) => router.push(`/inventario/productos/${product.id}`)}
              onDelete={handleDeleteProduct}
            />
          )}
          {tab === 'recipes' && (
            <DishCards
              recipes={recipes}
              emptyText={`Aún no hay ${copy.recipes.toLowerCase()} en esta área.`}
              onEdit={(dish) => router.push(`/platos/${dish.id}`)}
              onDelete={handleDeleteDish}
              products={products}
              catalog={recipeCatalog}
              areaLabel={copy.label}
              hotelName={hotelName}
            />
          )}
          {tab === 'profitability' && <ProfitabilityView />}
        </div>
      </div>
    </>
  );
}
