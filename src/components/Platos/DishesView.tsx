'use client';

import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Dish } from '@/types';
import { useInventoryStore } from '@/store/inventoryStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { MARGIN_REVIEW, analyzeDish, formatMoney } from '@/lib/costing';
import { AREA_COPY } from '@/lib/inventory';
import { Drawer } from '@/components/ui/Drawer';
import { StatBox } from '@/components/ui/Form';
import { MarginBadge } from '@/components/Costeo/shared';
import { DishForm } from './DishForm';

const FORM_ID = 'dish-form';

export function DishesView() {
  const { hotelId, area } = useWorkspaceStore();
  const { ingredients, dishes, saveDish, deleteDish } = useInventoryStore();
  const copy = AREA_COPY[area];

  // `session` reinicia el formulario en cada apertura; `editing` se conserva al cerrar
  // para que el panel no cambie de contenido durante la animación de salida.
  const [drawer, setDrawer] = useState<{ open: boolean; editing?: Dish; session: number }>({
    open: false,
    session: 0,
  });
  const openDrawer = (editing?: Dish) =>
    setDrawer((current) => ({ open: true, editing, session: current.session + 1 }));
  const closeDrawer = () => setDrawer((current) => ({ ...current, open: false }));

  const products = ingredients.filter((ing) => ing.hotelId === hotelId && ing.area === area);
  const rows = dishes
    .filter((dish) => dish.hotelId === hotelId && dish.area === area)
    .map((dish) => ({ dish, analysis: analyzeDish(dish, products) }));

  const avgMargin =
    rows.length > 0 ? rows.reduce((sum, row) => sum + row.analysis.marginPercentage, 0) / rows.length : 0;
  const lowMarginCount = rows.filter((row) => row.analysis.marginPercentage <= MARGIN_REVIEW).length;

  const handleDelete = (dish: Dish) => {
    if (window.confirm(`¿Eliminar "${dish.name}"?`)) deleteDish(dish.id);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatBox tone="blue" label={`Total de ${copy.recipes.toLowerCase()}`} value={rows.length} hint={copy.label} />
        <StatBox tone="green" label="Margen promedio" value={`${avgMargin.toFixed(1)}%`} />
        <StatBox
          tone={lowMarginCount > 0 ? 'red' : 'purple'}
          label="Con margen bajo"
          value={lowMarginCount}
          hint={`${MARGIN_REVIEW}% o menos`}
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => openDrawer()}
          disabled={products.length === 0}
          title={products.length === 0 ? 'Primero agrega productos en Inventario' : undefined}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          <Plus size={18} />
          {copy.newRecipe}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left font-semibold text-gray-700">{copy.recipe}</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Costo</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Precio</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Margen</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">% Margen</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ dish, analysis }) => (
              <tr key={dish.id} className="border-b border-gray-200 transition-colors hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{dish.name}</p>
                  {dish.description && <p className="text-xs text-gray-500">{dish.description}</p>}
                </td>
                <td className="px-4 py-3 text-right text-gray-600">{formatMoney(analysis.totalCost)}</td>
                <td className="px-4 py-3 text-right text-gray-600">{formatMoney(analysis.sellingPrice)}</td>
                <td
                  className={`px-4 py-3 text-right font-semibold ${
                    analysis.margin < 0 ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {formatMoney(analysis.margin)}
                </td>
                <td className="px-4 py-3 text-right">
                  <MarginBadge percentage={analysis.marginPercentage} />
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => openDrawer(dish)}
                      aria-label={`Editar ${dish.name}`}
                      title="Editar"
                      className="rounded p-1 text-blue-600 transition-colors hover:bg-blue-50"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(dish)}
                      aria-label={`Eliminar ${dish.name}`}
                      title="Eliminar"
                      className="rounded p-1 text-red-600 transition-colors hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                  Aún no hay {copy.recipes.toLowerCase()} en esta área.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Drawer
        open={drawer.open}
        onClose={closeDrawer}
        title={drawer.editing ? `Editar ${copy.recipe.toLowerCase()}` : copy.newTitle}
        description={`${copy.label} · el costo usa el costo promedio de los productos de esta área.`}
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
              {drawer.editing ? 'Guardar cambios' : copy.newRecipe}
            </button>
          </>
        }
      >
        <DishForm
          key={drawer.session}
          formId={FORM_ID}
          initial={drawer.editing}
          ingredients={products}
          area={area}
          onSubmit={(input) => {
            saveDish({ ...input, hotelId, area }, drawer.editing?.id);
            closeDrawer();
          }}
        />
      </Drawer>
    </div>
  );
}
