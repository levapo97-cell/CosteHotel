'use client';

import { useState } from 'react';
import { useInventoryStore } from '@/store/inventoryStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import {
  MARGIN_BADGE,
  MARGIN_OPTIMAL,
  MARGIN_REVIEW,
  analyzeDish,
  formatMoney,
  marginStatus,
} from '@/lib/costing';
import { AREA_COPY } from '@/lib/inventory';
import { StatBox } from '@/components/ui/Form';
import { MarginBadge } from './shared';

type ReportType = 'profitability' | 'ingredients' | 'costBreakdown';

const REPORTS: { id: ReportType; label: string }[] = [
  { id: 'profitability', label: 'Rentabilidad' },
  { id: 'ingredients', label: 'Productos con más impacto' },
  { id: 'costBreakdown', label: 'Desglose de costos' },
];

const STATUS_TEXT = {
  optimal: 'text-green-600',
  review: 'text-yellow-600',
  critical: 'text-red-600',
};

export function ReportsTab() {
  const { hotelId, area } = useWorkspaceStore();
  const allIngredients = useInventoryStore((state) => state.ingredients);
  const allDishes = useInventoryStore((state) => state.dishes);
  const [reportType, setReportType] = useState<ReportType>('profitability');
  const copy = AREA_COPY[area];

  const ingredients = allIngredients.filter((ing) => ing.hotelId === hotelId && ing.area === area);
  const dishes = allDishes.filter((dish) => dish.hotelId === hotelId && dish.area === area);

  const analyses = dishes
    .map((dish) => analyzeDish(dish, ingredients))
    .sort((a, b) => b.marginPercentage - a.marginPercentage);

  const totalRevenue = analyses.reduce((sum, a) => sum + a.sellingPrice, 0);
  const totalCosts = analyses.reduce((sum, a) => sum + a.totalCost, 0);
  const totalMargin = totalRevenue - totalCosts;
  const globalMarginPercentage = totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0;

  const countByStatus = { optimal: 0, review: 0, critical: 0 };
  analyses.forEach((a) => countByStatus[marginStatus(a.marginPercentage)]++);

  const ingredientImpact = ingredients
    .map((ing) => {
      const uses = dishes.flatMap((dish) => dish.ingredients.filter((item) => item.ingredientId === ing.id));
      return {
        ingredient: ing,
        dishCount: uses.length,
        impact: uses.reduce((sum, item) => sum + ing.costPerUnit * item.quantityNeeded, 0),
      };
    })
    .sort((a, b) => b.impact - a.impact);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatBox
          tone="green"
          label="Margen global"
          value={`${globalMarginPercentage.toFixed(1)}%`}
          hint={`${formatMoney(totalMargin)} de ${formatMoney(totalRevenue)} (una venta de cada receta)`}
        />
        <StatBox tone="blue" label={`${copy.recipes} rentables`} value={countByStatus.optimal} hint={`Margen > ${MARGIN_OPTIMAL}%`} />
        <StatBox
          tone="yellow"
          label="Rentabilidad media"
          value={countByStatus.review}
          hint={`${MARGIN_REVIEW}% - ${MARGIN_OPTIMAL}% de margen`}
        />
        <StatBox tone="red" label="Baja rentabilidad" value={countByStatus.critical} hint={`${MARGIN_REVIEW}% o menos`} />
      </div>

      <div className="flex flex-wrap gap-2">
        {REPORTS.map((report) => (
          <button
            key={report.id}
            onClick={() => setReportType(report.id)}
            aria-pressed={reportType === report.id}
            className={`rounded-lg px-4 py-2 font-medium transition-colors ${
              reportType === report.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {report.label}
          </button>
        ))}
      </div>

      {reportType === 'profitability' && (
        <section className="rounded-lg border border-gray-200 bg-white">
          <h3 className="border-b border-gray-200 bg-gray-50 p-4 font-semibold text-gray-900">
            Rentabilidad por {copy.recipe.toLowerCase()}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">{copy.recipe}</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Costo</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Precio</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Margen $</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Margen %</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Estado</th>
                </tr>
              </thead>
              <tbody>
                {analyses.map((a) => {
                  const status = marginStatus(a.marginPercentage);
                  return (
                    <tr key={a.dishId} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{a.dishName}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{formatMoney(a.totalCost)}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{formatMoney(a.sellingPrice)}</td>
                      <td
                        className={`px-4 py-3 text-right font-semibold ${a.margin < 0 ? 'text-red-600' : 'text-green-600'}`}
                      >
                        {formatMoney(a.margin)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <MarginBadge percentage={a.marginPercentage} />
                      </td>
                      <td className={`px-4 py-3 font-medium ${STATUS_TEXT[status]}`}>{MARGIN_BADGE[status].label}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {reportType === 'ingredients' && (
        <section className="rounded-lg border border-gray-200 bg-white">
          <h3 className="border-b border-gray-200 bg-gray-50 p-4 font-semibold text-gray-900">
            Productos con mayor impacto en costos
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Producto</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Costo unitario</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">{copy.recipes} que lo usan</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Impacto total</th>
                </tr>
              </thead>
              <tbody>
                {ingredientImpact.map(({ ingredient, dishCount, impact }) => (
                  <tr key={ingredient.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{ingredient.name}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{formatMoney(ingredient.costPerUnit)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{dishCount}</td>
                    <td className="px-4 py-3 text-right font-semibold text-orange-600">{formatMoney(impact)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {reportType === 'costBreakdown' && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <section className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 font-semibold text-gray-900">Distribución de costos</h3>
            <div className="space-y-3">
              {analyses.map((a) => {
                const percentage = totalCosts > 0 ? (a.totalCost / totalCosts) * 100 : 0;
                return (
                  <div key={a.dishId}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{a.dishName}</span>
                      <span className="text-sm text-gray-600">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div className="h-2 rounded-full bg-blue-600 transition-all" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 font-semibold text-gray-900">Resumen financiero</h3>
            <dl className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <dt className="text-gray-700">Ingresos totales</dt>
                <dd className="font-semibold text-gray-900">{formatMoney(totalRevenue)}</dd>
              </div>
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <dt className="text-gray-700">Costos totales</dt>
                <dd className="font-semibold text-gray-900">{formatMoney(totalCosts)}</dd>
              </div>
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <dt className="text-gray-700">Margen total</dt>
                <dd className={`font-semibold ${totalMargin < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatMoney(totalMargin)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="font-medium text-gray-700">Margen %</dt>
                <dd className="text-2xl font-bold text-green-600">{globalMarginPercentage.toFixed(1)}%</dd>
              </div>
            </dl>
          </section>
        </div>
      )}
    </div>
  );
}
