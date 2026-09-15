'use client';

import { Dish, DishIngredient, CostAnalysis, Ingredient } from '@/types';
import { useState } from 'react';
import * as Icons from 'lucide-react';

const DEMO_INGREDIENTS: Ingredient[] = [
  { id: '1', name: 'Pechuga de Pollo', unitType: 'kg', costPerUnit: 8.50, currentStock: 15, lastUpdated: '2026-09-15' },
  { id: '2', name: 'Arroz Blanco', unitType: 'kg', costPerUnit: 2.20, currentStock: 45, lastUpdated: '2026-09-14' },
  { id: '3', name: 'Tomate Fresco', unitType: 'kg', costPerUnit: 1.80, currentStock: 28, lastUpdated: '2026-09-15' },
];

const DEMO_DISHES: Dish[] = [
  {
    id: '1',
    name: 'Pollo a la Grilla',
    sellingPrice: 25.00,
    ingredients: [
      { ingredientId: '1', quantityNeeded: 0.3 },
      { ingredientId: '2', quantityNeeded: 0.2 },
    ],
  },
  {
    id: '2',
    name: 'Ensalada de Tomate y Pollo',
    sellingPrice: 18.00,
    ingredients: [
      { ingredientId: '1', quantityNeeded: 0.25 },
      { ingredientId: '3', quantityNeeded: 0.15 },
    ],
  },
  {
    id: '3',
    name: 'Arroz con Pollo',
    sellingPrice: 22.00,
    ingredients: [
      { ingredientId: '1', quantityNeeded: 0.35 },
      { ingredientId: '2', quantityNeeded: 0.4 },
    ],
  },
];

type ReportType = 'profitability' | 'ingredients' | 'costBreakdown';

export function ReportsTab() {
  const [reportType, setReportType] = useState<ReportType>('profitability');

  const calculateDishCost = (ingredients: DishIngredient[]): number => {
    return ingredients.reduce((total, dishIng) => {
      const ingredient = DEMO_INGREDIENTS.find((ing) => ing.id === dishIng.ingredientId);
      return total + (ingredient ? ingredient.costPerUnit * dishIng.quantityNeeded : 0);
    }, 0);
  };

  const costAnalyses: CostAnalysis[] = DEMO_DISHES.map((dish) => {
    const totalCost = calculateDishCost(dish.ingredients);
    const margin = dish.sellingPrice - totalCost;
    const marginPercentage = (margin / dish.sellingPrice) * 100;

    return {
      dishId: dish.id,
      dishName: dish.name,
      totalCost,
      sellingPrice: dish.sellingPrice,
      margin,
      marginPercentage,
    };
  });

  const totalRevenue = costAnalyses.reduce((sum, c) => sum + c.sellingPrice, 0);
  const totalCosts = costAnalyses.reduce((sum, c) => sum + c.totalCost, 0);
  const totalMargin = totalRevenue - totalCosts;
  const globalMarginPercentage = (totalMargin / totalRevenue) * 100;

  const profitableCount = costAnalyses.filter((c) => c.marginPercentage > 35).length;
  const mediumCount = costAnalyses.filter((c) => c.marginPercentage > 25 && c.marginPercentage <= 35).length;
  const lowCount = costAnalyses.filter((c) => c.marginPercentage <= 25).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-gray-600">Margen Global</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{globalMarginPercentage.toFixed(1)}%</p>
          <p className="text-xs text-gray-600 mt-2">${totalMargin.toFixed(2)} de ${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-gray-600">Platos Rentables</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{profitableCount}</p>
          <p className="text-xs text-gray-600 mt-2">Margen &gt; 35%</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <p className="text-sm text-gray-600">Rentabilidad Media</p>
          <p className="text-2xl font-bold text-yellow-700 mt-1">{mediumCount}</p>
          <p className="text-xs text-gray-600 mt-2">25% - 35% margen</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <p className="text-sm text-gray-600">Baja Rentabilidad</p>
          <p className="text-2xl font-bold text-red-700 mt-1">{lowCount}</p>
          <p className="text-xs text-gray-600 mt-2">&lt; 25% margen</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: 'profitability', label: '📊 Rentabilidad', icon: 'TrendingUp' },
            { id: 'ingredients', label: '🥘 Ingredientes Caros', icon: 'AlertCircle' },
            { id: 'costBreakdown', label: '📈 Desglose de Costos', icon: 'PieChart' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              reportType === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {reportType === 'profitability' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900">Análisis de Rentabilidad por Plato</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Plato</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-700">Costo</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-700">Precio</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-700">Margen $</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-700">Margen %</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {costAnalyses
                    .sort((a, b) => b.marginPercentage - a.marginPercentage)
                    .map((analysis) => (
                      <tr key={analysis.dishId} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900 font-medium">{analysis.dishName}</td>
                        <td className="text-right px-4 py-3 text-gray-600">${analysis.totalCost.toFixed(2)}</td>
                        <td className="text-right px-4 py-3 text-gray-600">${analysis.sellingPrice.toFixed(2)}</td>
                        <td className="text-right px-4 py-3 text-green-600 font-semibold">${analysis.margin.toFixed(2)}</td>
                        <td className="text-right px-4 py-3 font-semibold">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs ${
                              analysis.marginPercentage > 35
                                ? 'bg-green-100 text-green-800'
                                : analysis.marginPercentage > 25
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {analysis.marginPercentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {analysis.marginPercentage > 35 && (
                            <span className="text-green-600 font-medium">✓ Óptimo</span>
                          )}
                          {analysis.marginPercentage > 25 && analysis.marginPercentage <= 35 && (
                            <span className="text-yellow-600 font-medium">⚠ Revisar</span>
                          )}
                          {analysis.marginPercentage <= 25 && (
                            <span className="text-red-600 font-medium">✕ Crítico</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {reportType === 'ingredients' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-semibold text-gray-900">Ingredientes con Mayor Impacto en Costos</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Ingrediente</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-700">Costo Unitario</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-700">Platos que usan</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-700">Impacto Total</th>
                  </tr>
                </thead>
                <tbody>
                  {DEMO_INGREDIENTS.sort((a, b) => b.costPerUnit - a.costPerUnit).map((ing) => {
                    const dishesUsingIt = DEMO_DISHES.filter((dish) =>
                      dish.ingredients.some((di) => di.ingredientId === ing.id)
                    );
                    const totalImpact = dishesUsingIt.reduce((sum, dish) => {
                      const di = dish.ingredients.find((i) => i.ingredientId === ing.id);
                      return sum + (di ? ing.costPerUnit * di.quantityNeeded : 0);
                    }, 0);

                    return (
                      <tr key={ing.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900 font-medium">{ing.name}</td>
                        <td className="text-right px-4 py-3 text-gray-600">${ing.costPerUnit.toFixed(2)}</td>
                        <td className="text-right px-4 py-3 text-gray-600">{dishesUsingIt.length}</td>
                        <td className="text-right px-4 py-3 text-orange-600 font-semibold">${totalImpact.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {reportType === 'costBreakdown' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Distribución de Costos</h3>
              <div className="space-y-3">
                {DEMO_DISHES.map((dish) => {
                  const cost = calculateDishCost(dish.ingredients);
                  const percentage = (cost / totalCosts) * 100;
                  return (
                    <div key={dish.id}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-900">{dish.name}</span>
                        <span className="text-sm text-gray-600">{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Resumen Financiero</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-700">Ingresos Totales</span>
                  <span className="font-semibold text-gray-900">${totalRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-700">Costos Totales</span>
                  <span className="font-semibold text-gray-900">${totalCosts.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-700">Margen Total</span>
                  <span className="font-semibold text-green-600">${totalMargin.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Margen %</span>
                  <span className="text-2xl font-bold text-green-600">{globalMarginPercentage.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
