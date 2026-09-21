'use client';

import { Plus } from 'lucide-react';
import { Dish } from '@/types';
import { useInventoryStore } from '@/store/inventoryStore';
import { MARGIN_REVIEW } from '@/lib/costing';
import { useWorkspaceData } from '@/components/Workspace/useWorkspaceData';
import { PageHeader } from '@/components/Layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { KpiCard, KpiGrid } from '@/components/ui/Card';
import { formatPercent } from '@/components/ui/format';
import { marginTone } from '@/components/ui/tone';
import { useDrawerState } from '@/components/ui/useDrawerState';
import { DishCards } from './DishCards';
import { DishDrawer } from './DishDrawer';

export function DishesView() {
  const { copy, products, recipes } = useWorkspaceData();
  const deleteDish = useInventoryStore((state) => state.deleteDish);
  const drawer = useDrawerState<Dish>();

  const avgMargin = recipes.length
    ? recipes.reduce((sum, r) => sum + r.analysis.marginPercentage, 0) / recipes.length
    : 0;
  const lowMarginCount = recipes.filter((r) => r.analysis.marginPercentage <= MARGIN_REVIEW).length;

  const handleDelete = (dish: Dish) => {
    if (window.confirm(`¿Eliminar "${dish.name}"?`)) deleteDish(dish.id);
  };

  return (
    <>
      <PageHeader
        title={copy.recipes}
        description="Recetas con sus productos y cantidades. El costo se actualiza solo con cada compra registrada."
        action={
          <Button
            onClick={() => drawer.show()}
            disabled={products.length === 0}
            title={products.length === 0 ? 'Primero agrega productos en Inventario' : undefined}
          >
            <Plus size={18} />
            {copy.newRecipe}
          </Button>
        }
      />

      <div className="space-y-8">
        <KpiGrid>
          <KpiCard label={`Total de ${copy.recipes.toLowerCase()}`} value={recipes.length} />
          <KpiCard
            label="Margen promedio"
            value={recipes.length ? formatPercent(avgMargin) : '—'}
            tone={recipes.length ? marginTone(avgMargin) : undefined}
          />
          <KpiCard
            label="Con margen bajo"
            value={lowMarginCount}
            tone={lowMarginCount > 0 ? 'bad' : 'ok'}
            note={`${MARGIN_REVIEW}% o menos`}
          />
        </KpiGrid>

        <DishCards
          recipes={recipes}
          emptyText={`Aún no hay ${copy.recipes.toLowerCase()} en esta área.`}
          onEdit={(dish) => drawer.show(dish)}
          onDelete={handleDelete}
        />
      </div>

      <DishDrawer drawer={drawer} products={products} />
    </>
  );
}
