'use client';

import { useMemo, useState } from 'react';
import { Dish, Ingredient, StockMovement } from '@/types';
import { UNIT_LABELS, analyzeDish, formatMoney } from '@/lib/costing';
import { costChangePoints, productsAsOf } from '@/lib/priceHistory';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDay, formatPercent } from '@/components/ui/format';
import { TONE_TEXT, marginTone } from '@/components/ui/tone';
import { inputClass } from '@/components/ui/Form';

interface PriceHistoryPanelProps {
  products: Ingredient[];
  movements: StockMovement[];
  recipes: { dish: Dish; analysis: { costPerServing: number; marginPercentage: number } }[];
  catalog: Dish[];
}

const today = () => new Date().toISOString().split('T')[0];

// Coste histórico por periodo (§3, §35): recostea cada receta con el costo promedio
// ponderado de sus productos vigente a una fecha, y muestra la evolución del costo
// de los productos que han cambiado de precio.
export function PriceHistoryPanel({ products, movements, recipes, catalog }: PriceHistoryPanelProps) {
  const [asOf, setAsOf] = useState<string>(today());
  const isToday = asOf === today();

  const historical = useMemo(() => {
    const historicalProducts = productsAsOf(products, movements, asOf);
    return recipes.map(({ dish, analysis }) => {
      const past = analyzeDish(dish, historicalProducts, catalog);
      const delta = analysis.costPerServing - past.costPerServing;
      const percent = past.costPerServing > 0 ? (delta / past.costPerServing) * 100 : 0;
      return { dish, past, currentCost: analysis.costPerServing, delta, percent };
    });
  }, [products, movements, asOf, recipes, catalog]);

  const evolution = useMemo(
    () =>
      products
        .map((product) => ({ product, points: costChangePoints(product.id, movements) }))
        .filter((row) => row.points.length > 1)
        .map((row) => {
          const first = row.points[0];
          const last = row.points[row.points.length - 1];
          const percent = first.avgCost > 0 ? ((last.avgCost - first.avgCost) / first.avgCost) * 100 : 0;
          return { ...row, first, last, percent };
        })
        .sort((a, b) => Math.abs(b.percent) - Math.abs(a.percent)),
    [products, movements]
  );

  return (
    <Card className="p-6 lg:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <CardTitle>Coste histórico por periodo</CardTitle>
          <p className="mt-1 max-w-[60ch] text-[13px] text-pretty text-muted">
            Recostea cada receta con el precio de sus productos vigente a la fecha elegida. Responde &ldquo;¿cuánto costaba
            realmente este plato?&rdquo; usando el promedio ponderado de las compras registradas.
          </p>
        </div>
        <label className="flex flex-col gap-1 text-xs font-medium text-muted">
          Costo a la fecha
          <input
            type="date"
            value={asOf}
            max={today()}
            onChange={(event) => setAsOf(event.target.value || today())}
            className={inputClass()}
          />
        </label>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[11px] tracking-wide text-muted uppercase">
              <th className="py-2 pr-3 font-medium">Receta</th>
              <th className="py-2 pr-3 text-right font-medium">Coste al {formatDay(asOf)}</th>
              <th className="py-2 pr-3 text-right font-medium">Coste hoy</th>
              <th className="py-2 pr-3 text-right font-medium">Variación</th>
              <th className="py-2 text-right font-medium">Margen al {formatDay(asOf)}</th>
            </tr>
          </thead>
          <tbody>
            {historical.map(({ dish, past, currentCost, delta, percent }) => {
              const tone = delta > 0 ? 'bad' : delta < 0 ? 'ok' : 'neutral';
              return (
                <tr key={dish.id} className="border-b border-line last:border-0">
                  <td className="py-2.5 pr-3 font-medium text-ink">{dish.name}</td>
                  <td className="py-2.5 pr-3 text-right tabular-nums">{formatMoney(past.costPerServing)}</td>
                  <td className="py-2.5 pr-3 text-right tabular-nums">{formatMoney(currentCost)}</td>
                  <td className="py-2.5 pr-3 text-right tabular-nums">
                    {isToday || Math.abs(delta) < 0.005 ? (
                      <span className="text-muted">—</span>
                    ) : (
                      <span className={tone === 'bad' ? 'text-bad' : 'text-ok'}>{formatPercent(percent, true)}</span>
                    )}
                  </td>
                  <td className={`py-2.5 text-right font-semibold tabular-nums ${TONE_TEXT[marginTone(past.marginPercentage)]}`}>
                    {formatPercent(past.marginPercentage)}
                  </td>
                </tr>
              );
            })}
            {historical.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-[13px] text-muted">
                  Sin recetas que costear en esta área.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h3 className="mt-8 mb-2 text-xs font-semibold tracking-wide text-muted uppercase">Evolución del costo de los productos</h3>
      {evolution.length === 0 ? (
        <p className="text-[13px] text-muted">
          Todavía no hay productos con cambios de costo. Cuando registres compras a distinto precio, aquí verás su evolución.
        </p>
      ) : (
        <ul className="divide-y divide-line border-t border-line">
          {evolution.map(({ product, first, last, percent }) => (
            <li key={product.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5">
              <div className="min-w-0">
                <p className="font-medium text-ink">{product.name}</p>
                <p className="text-xs text-muted">
                  {formatDay(first.date.split('T')[0])} · {formatMoney(first.avgCost)} → {formatDay(last.date.split('T')[0])} ·{' '}
                  {formatMoney(last.avgCost)} por {UNIT_LABELS[product.unitType]}
                </p>
              </div>
              <Badge tone={percent > 0 ? 'bad' : percent < 0 ? 'ok' : 'neutral'}>{formatPercent(percent, true)}</Badge>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
