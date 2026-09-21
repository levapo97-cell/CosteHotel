import { Pencil, Trash2 } from 'lucide-react';
import { CostAnalysis, Dish } from '@/types';
import { MARGIN_BADGE, formatMoney, marginStatus } from '@/lib/costing';
import { Badge, ProgressBar } from '@/components/ui/Badge';
import { buttonClass } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatPercent } from '@/components/ui/format';
import { TONE_TEXT, marginTone } from '@/components/ui/tone';

interface DishCardsProps {
  recipes: { dish: Dish; analysis: CostAnalysis }[];
  emptyText: string;
  onEdit: (dish: Dish) => void;
  onDelete: (dish: Dish) => void;
}

export function DishCards({ recipes, emptyText, onEdit, onDelete }: DishCardsProps) {
  if (recipes.length === 0) {
    return <p className="rounded-card border border-dashed border-line px-5 py-12 text-center text-muted">{emptyText}</p>;
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-4">
      {recipes.map(({ dish, analysis }) => {
        const tone = marginTone(analysis.marginPercentage);
        const count = dish.ingredients.length;
        return (
          <Card key={dish.id} className="flex flex-col gap-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-display text-card-title font-semibold text-pretty text-ink">{dish.name}</h3>
                <p className="mt-0.5 text-xs text-muted">
                  {count} {count === 1 ? 'producto' : 'productos'} · {formatMoney(analysis.totalCost)} por unidad
                </p>
              </div>
              <Badge tone={tone}>{MARGIN_BADGE[marginStatus(analysis.marginPercentage)].label}</Badge>
            </div>

            {dish.description && <p className="line-clamp-2 text-[13px] text-muted">{dish.description}</p>}

            <dl className="grid grid-cols-3 gap-3">
              <div>
                <dt className="text-[11px] tracking-wide text-muted uppercase">Costo</dt>
                <dd className="mt-0.5 font-semibold text-ink">{formatMoney(analysis.totalCost)}</dd>
              </div>
              <div>
                <dt className="text-[11px] tracking-wide text-muted uppercase">Precio</dt>
                <dd className="mt-0.5 font-semibold text-ink">{formatMoney(analysis.sellingPrice)}</dd>
              </div>
              <div>
                <dt className="text-[11px] tracking-wide text-muted uppercase">Margen</dt>
                <dd className={`mt-0.5 font-semibold ${TONE_TEXT[tone]}`}>{formatMoney(analysis.margin)}</dd>
              </div>
            </dl>

            <div className="mt-auto space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted">Margen sobre precio</span>
                <span className={`font-semibold ${TONE_TEXT[tone]}`}>{formatPercent(analysis.marginPercentage)}</span>
              </div>
              <ProgressBar value={analysis.marginPercentage / 100} tone={tone} label={`Margen de ${dish.name}`} />
            </div>

            <div className="-mb-1 flex justify-end gap-1 border-t border-line pt-3">
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
    </div>
  );
}
