'use client';

import { useState } from 'react';
import { ArrowLeftRight, Plus } from 'lucide-react';
import { Ingredient, MovementType } from '@/types';
import { useInventoryStore } from '@/store/inventoryStore';
import { formatMoney } from '@/lib/costing';
import { MOVEMENT_TYPES, isLowStock } from '@/lib/inventory';
import { useWorkspaceData } from '@/components/Workspace/useWorkspaceData';
import { PageHeader } from '@/components/Layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { KpiCard, KpiGrid } from '@/components/ui/Card';
import { Select } from '@/components/ui/Form';
import { Tabs } from '@/components/ui/Tabs';
import { useDrawerState } from '@/components/ui/useDrawerState';
import { ProductsTable } from './ProductsTable';
import { MovementsTable } from './MovementsTable';
import { ProductDrawer, ProductDrawerPayload } from './ProductDrawer';

type Tab = 'stock' | 'movements';

export function InventoryView() {
  const { products, movements, usageCount } = useWorkspaceData();
  const deleteProduct = useInventoryStore((state) => state.deleteProduct);
  const drawer = useDrawerState<ProductDrawerPayload>();

  const [tab, setTab] = useState<Tab>('stock');
  const [typeFilter, setTypeFilter] = useState<MovementType | ''>('');
  const [productFilter, setProductFilter] = useState('');

  const productsById = new Map(products.map((p) => [p.id, p]));
  // Al cambiar de hotel o área, un filtro de producto de otra área deja de aplicar.
  const activeProductFilter = productsById.has(productFilter) ? productFilter : '';
  const visibleMovements = movements.filter(
    (mov) => (!typeFilter || mov.type === typeFilter) && (!activeProductFilter || mov.ingredientId === activeProductFilter)
  );

  const inventoryValue = products.reduce((sum, p) => sum + p.costPerUnit * p.currentStock, 0);
  const lowCount = products.filter(isLowStock).length;
  const unused = products.filter((p) => usageCount(p.id) === 0);

  const handleDelete = (product: Ingredient) => {
    if (window.confirm(`¿Eliminar "${product.name}" y su historial de movimientos?`)) deleteProduct(product.id);
  };

  return (
    <>
      <PageHeader
        title="Inventario"
        description="Stock, compras y mermas de cada área. El stock y el costo solo cambian con movimientos registrados."
        action={
          <>
            <Button variant="outline" onClick={() => drawer.show({ kind: 'movement' })} disabled={products.length === 0}>
              <ArrowLeftRight size={18} />
              Registrar movimiento
            </Button>
            <Button onClick={() => drawer.show({ kind: 'product' })}>
              <Plus size={18} />
              Nuevo producto
            </Button>
          </>
        }
      />

      <div className="space-y-8">
        <KpiGrid>
          <KpiCard label="Productos" value={products.length} note={`${movements.length} movimientos registrados`} />
          <KpiCard label="Valor del inventario" value={formatMoney(inventoryValue)} />
          <KpiCard
            label="Bajo mínimo"
            value={lowCount}
            tone={lowCount > 0 ? 'bad' : 'ok'}
            note={lowCount > 0 ? 'Conviene programar compras' : 'Todo el stock sobre el mínimo'}
          />
          <KpiCard
            label="Sin usar en recetas"
            value={unused.length}
            note={`${formatMoney(unused.reduce((sum, p) => sum + p.costPerUnit * p.currentStock, 0))} de capital inmovilizado`}
          />
        </KpiGrid>

        <div className="space-y-6">
          <Tabs<Tab>
            label="Secciones de inventario"
            value={tab}
            onChange={setTab}
            tabs={[
              { value: 'stock', label: 'Stock', count: products.length },
              { value: 'movements', label: 'Movimientos', count: movements.length },
            ]}
          />

          {tab === 'stock' ? (
            <ProductsTable
              products={products}
              movements={movements}
              usageCount={usageCount}
              onMove={(product) => drawer.show({ kind: 'movement', product })}
              onEdit={(product) => drawer.show({ kind: 'product', product })}
              onDelete={handleDelete}
            />
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as MovementType | '')}
                  aria-label="Filtrar por tipo"
                  className="w-full max-w-44"
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
                  className="w-full max-w-60"
                >
                  <option value="">Todos los productos</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
                <p className="ml-auto text-xs text-muted">
                  {visibleMovements.length} de {movements.length} movimientos
                </p>
              </div>
              <MovementsTable movements={visibleMovements} productsById={productsById} />
            </div>
          )}
        </div>
      </div>

      <ProductDrawer drawer={drawer} products={products} />
    </>
  );
}
