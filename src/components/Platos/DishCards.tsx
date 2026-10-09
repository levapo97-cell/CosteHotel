'use client';

import { useState } from 'react';
import { FileText, Pencil, Trash2 } from 'lucide-react';
import { CostAnalysis, Dish, Ingredient } from '@/types';
import { MARGIN_BADGE, formatMoney, marginStatus } from '@/lib/costing';
import { allergenLabel, effectiveAllergens } from '@/lib/allergens';
import { Badge, ProgressBar } from '@/components/ui/Badge';
import { buttonClass } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatPercent } from '@/components/ui/format';
import { TONE_TEXT, marginTone } from '@/components/ui/tone';
import { FichaTecnica } from './FichaTecnica';

interface DishRecipe {
  dish: Dish;
  analysis: CostAnalysis;
}

interface DishCardsProps {
  recipes: DishRecipe[];
  emptyText: string;
  onEdit: (dish: Dish) => void;
  onDelete: (dish: Dish) => void;
  // Contexto para la ficha técnica (§28). Si no se pasan, se oculta el botón.
  products?: Ingredient[];
  catalog?: Dish[];
  areaLabel?: string;
  hotelName?: string;
}

export function DishCards({ recipes, emptyText, onEdit, onDelete, products, catalog, areaLabel = '', hotelName = '' }: DishCardsProps) {
  const [ficha, setFicha] = useState<DishRecipe | null>(null);
  const canShowFicha = !!products && !!catalog;

  if (recipes.length === 0) {
    return <p className="rounded-card border border-dashed border-line px-5 py-12 text-center text-muted">{emptyText}</p>;
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-4">
      {recipes.map(({ dish, analysis }) => {
        const tone = marginTone(analysis.marginPercentage);
        const count = dish.ingredients.length;
        const allergens = canShowFicha ? effectiveAllergens(dish, products!, catalog!) : [];
        return (
          <Card key={dish.id} className="flex flex-col gap-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-display text-card-title font-semibold text-pretty text-ink">{dish.name}</h3>
                <p className="mt-0.5 text-xs text-muted">
                  {count} {count === 1 ? 'producto' : 'productos'} · {formatMoney(analysis.costPerServing)} por porción
                </p>
              </div>
              <Badge tone={tone}>{MARGIN_BADGE[marginStatus(analysis.marginPercentage)].label}</Badge>
            </div>

            {dish.description && <p className="line-clamp-2 text-[13px] text-muted">{dish.description}</p>}

            {allergens.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {allergens.map((id) => (
                  <Badge key={id} tone="warn">
                    {allergenLabel(id)}
                  </Badge>
                ))}
              </div>
            )}

            <dl className="grid grid-cols-3 gap-3 border-t border-line pt-4">
              <div>
                <dt className="text-[10px] tracking-[0.07em] text-muted uppercase">Costo porción</dt>
                <dd className="mt-1 font-semibold tabular-nums text-ink">{formatMoney(analysis.costPerServing)}</dd>
              </div>
              <div>
                <dt className="text-[10px] tracking-[0.07em] text-muted uppercase">Precio</dt>
                <dd className="mt-1 font-semibold tabular-nums text-ink">{formatMoney(analysis.sellingPrice)}</dd>
              </div>
              <div>
                <dt className="text-[10px] tracking-[0.07em] text-muted uppercase">Margen</dt>
                <dd className={`mt-1 font-semibold tabular-nums ${TONE_TEXT[tone]}`}>{formatMoney(analysis.margin)}</dd>
              </div>
            </dl>

            <div className="mt-auto space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted">Margen sobre precio</span>
                <span className={`font-semibold tabular-nums ${TONE_TEXT[tone]}`}>{formatPercent(analysis.marginPercentage)}</span>
              </div>
              <ProgressBar value={analysis.marginPercentage / 100} tone={tone} label={`Margen de ${dish.name}`} />
            </div>

            <div className="-mb-1 flex justify-end gap-1 border-t border-line pt-3">
              {canShowFicha && (
                <button
                  type="button"
                  onClick={() => setFicha({ dish, analysis })}
                  aria-label={`Ficha técnica de ${dish.name}`}
                  title="Ficha técnica"
                  className={buttonClass('icon')}
                >
                  <FileText size={16} />
                </button>
              )}
              <button type="button" onClick={() => onEdit(dish)} aria-label={`Editar ${dish.name}`} title="Editar" className={buttonClass('icon')}>
                <Pencil size={16} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(dish)}
                aria-label={`Eliminar ${dish.name}`}
                title="Eliminar"
                className={buttonClass('icon-danger')}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </Card>
        );
      })}

      {ficha && canShowFicha && (
        <FichaTecnica
          dish={ficha.dish}
          analysis={ficha.analysis}
          products={products!}
          catalog={catalog!}
          areaLabel={areaLabel}
          hotelName={hotelName}
          onClose={() => setFicha(null)}
        />
      )}
    </div>
  );
}
