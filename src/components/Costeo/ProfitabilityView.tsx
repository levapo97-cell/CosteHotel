'use client';

import { TrendingDown, TrendingUp } from 'lucide-react';
import { Area } from '@/types';
import { useInventoryStore } from '@/store/inventoryStore';
import { UNIT_LABELS, analyzeDish, formatMoney } from '@/lib/costing';
import { AREA_COPY, formatDateTime } from '@/lib/inventory';
import { useWorkspaceData } from '@/components/Workspace/useWorkspaceData';
import { Badge, ProgressBar } from '@/components/ui/Badge';
import { Card, CardTitle } from '@/components/ui/Card';
import { formatPercent } from '@/components/ui/format';
import { TONE_TEXT, marginTone } from '@/components/ui/tone';
import { latestCostChange } from './costChanges';
import { ChannelTable } from './ChannelComparison';
import { PriceHistoryPanel } from './PriceHistoryPanel';

const AREAS: Area[] = ['restaurant', 'bar'];

export function ProfitabilityView() {
  const { hotelId, copy, products, recipes, recipeCatalog, movements } = useWorkspaceData();
  const { ingredients, dishes } = useInventoryStore();

  // Margen promedio de cada área del hotel activo, con su propio costo de productos
  // y su propio catálogo (incluye subrecetas para costearlas).
  const byArea = AREAS.map((area) => {
    const areaProducts = ingredients.filter((ing) => ing.hotelId === hotelId && ing.area === area);
    const areaCatalog = dishes.filter((dish) => dish.hotelId === hotelId && dish.area === area);
    const analyses = areaCatalog
      .filter((dish) => !dish.isSubrecipe)
      .map((dish) => analyzeDish(dish, areaProducts, areaCatalog));
    const prices = analyses.map((a) => a.sellingPrice);
    return {
      area,
      count: analyses.length,
      average: analyses.length ? analyses.reduce((sum, a) => sum + a.marginPercentage, 0) / analyses.length : 0,
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
    };
  });

  const change = latestCostChange(products, movements);
  const affected = change
    ? recipes.filter(({ dish }) => dish.ingredients.some((item) => item.ingredientId === change.product.id))
    : [];

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(360px,100%),1fr))] gap-4">
      <Card className="p-6">
        <CardTitle>Margen promedio por área</CardTitle>
        <p className="mt-1 text-[13px] text-muted">Promedio simple del margen bruto de cada receta sobre el precio sin IVA del canal principal.</p>

        <div className="mt-6 space-y-6">
          {byArea.map(({ area, count, average, minPrice, maxPrice }) => {
            const tone = marginTone(average);
            return (
              <div key={area} className="space-y-2">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-medium text-ink">{AREA_COPY[area].label}</p>
                  <p className={`text-lg font-semibold ${count ? TONE_TEXT[tone] : 'text-muted'}`}>
                    {count ? formatPercent(average) : '—'}
                  </p>
                </div>
                <ProgressBar value={count ? average / 100 : 0} tone={tone} label={`Margen promedio de ${AREA_COPY[area].label}`} />
                <p className="text-xs text-muted">
                  {count === 0
                    ? 'Sin recetas registradas'
                    : `${count} ${count === 1 ? 'receta' : 'recetas'} · precios de carta de ${formatMoney(minPrice)} a ${formatMoney(maxPrice)}`}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-6">
        <CardTitle>Impacto del último cambio de costo</CardTitle>
        {change ? (
          <>
            <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-base font-semibold text-ink">
              {change.percent > 0 ? (
                <TrendingUp size={18} className="text-bad" aria-hidden />
              ) : (
                <TrendingDown size={18} className="text-ok" aria-hidden />
              )}
              {change.product.name}
              <span className={change.percent > 0 ? 'text-bad' : 'text-ok'}>{formatPercent(change.percent, true)}</span>
              <span className="text-muted">→</span>
              {affected.length} {affected.length === 1 ? 'receta recalculada' : 'recetas recalculadas'}
            </p>
            <p className="mt-1 text-xs text-muted">
              Compra del {formatDateTime(change.date)} · {formatMoney(change.previousCost)} → {formatMoney(change.currentCost)} por{' '}
              {UNIT_LABELS[change.product.unitType]}
            </p>

            {affected.length > 0 ? (
              <ul className="mt-5 divide-y divide-line border-t border-line">
                {affected.map(({ dish, analysis }) => (
                  <li key={dish.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{dish.name}</p>
                      <p className="text-xs text-muted">
                        Coste por porción {formatMoney(analysis.costPerServing)} · PVP {formatMoney(analysis.sellingPrice)}
                      </p>
                    </div>
                    <Badge tone={marginTone(analysis.marginPercentage)}>{formatPercent(analysis.marginPercentage)}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-5 text-[13px] text-muted">Ninguna receta de esta área usa este producto.</p>
            )}
          </>
        ) : (
          <p className="mt-3 max-w-[48ch] text-[13px] text-pretty text-muted">
            Todavía no hay compras que cambien el costo de algún producto de {copy.label.toLowerCase()}. Cuando registres una
            compra en Inventario, aquí verás qué recetas se recalcularon y cómo quedó su margen.
          </p>
        )}
      </Card>

      <Card className="p-6 lg:col-span-2">
        <CardTitle>Comparativa por canal</CardTitle>
        <p className="mt-1 text-[13px] text-muted">
          Cómo cambia la rentabilidad del mismo plato según el canal de venta, su precio y sus comisiones. Totales de{' '}
          {copy.label.toLowerCase()}.
        </p>

        <div className="mt-5">
          <ChannelTable analyses={recipes.map(({ analysis }) => analysis)} />
        </div>
      </Card>

      <PriceHistoryPanel products={products} movements={movements} recipes={recipes} catalog={recipeCatalog} />
    </div>
  );
}
