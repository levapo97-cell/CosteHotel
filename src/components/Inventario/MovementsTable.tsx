import { Ingredient, MovementType, StockMovement } from '@/types';
import { UNIT_LABELS, formatMoney } from '@/lib/costing';
import { MOVEMENT_TYPES, formatDateTime, formatQty } from '@/lib/inventory';
import { Badge } from '@/components/ui/Badge';

const TYPE_TONE: Record<MovementType, 'ok' | 'bad' | 'gold' | 'neutral'> = {
  purchase: 'ok',
  consumption: 'neutral',
  waste: 'bad',
  adjustment: 'gold',
};

const GRID =
  'grid min-w-[860px] grid-cols-[minmax(120px,1fr)_minmax(150px,1.4fr)_minmax(90px,0.8fr)_minmax(90px,0.8fr)_minmax(80px,0.7fr)_minmax(90px,0.8fr)_minmax(140px,1.4fr)_minmax(110px,1fr)] items-center gap-x-4 px-5';

interface MovementsTableProps {
  movements: StockMovement[];
  productsById: Map<string, Ingredient>;
}

export function MovementsTable({ movements, productsById }: MovementsTableProps) {
  return (
    <div className="overflow-x-auto rounded-card border border-line">
      <div role="table" aria-label="Movimientos de inventario">
        <div
          role="row"
          className={`${GRID} border-b border-line bg-surface py-3 text-xs font-semibold tracking-wide text-muted uppercase`}
        >
          <div role="columnheader">Fecha</div>
          <div role="columnheader">Producto</div>
          <div role="columnheader">Tipo</div>
          <div role="columnheader" className="text-right">Cantidad</div>
          <div role="columnheader" className="text-right">Costo</div>
          <div role="columnheader" className="text-right">Stock final</div>
          <div role="columnheader">Nota</div>
          <div role="columnheader">Usuario</div>
        </div>

        {movements.map((movement) => {
          const product = productsById.get(movement.ingredientId);
          const unit = product ? UNIT_LABELS[product.unitType] : '';
          return (
            <div role="row" key={movement.id} className={`${GRID} border-b border-line py-4 last:border-b-0`}>
              <div role="cell" className="text-muted">{formatDateTime(movement.date)}</div>
              <div role="cell" className="truncate font-medium text-ink">{product?.name}</div>
              <div role="cell">
                <Badge tone={TYPE_TONE[movement.type]}>{MOVEMENT_TYPES[movement.type].label}</Badge>
              </div>
              <div role="cell" className={`text-right font-semibold ${movement.quantity < 0 ? 'text-bad' : 'text-ok'}`}>
                {movement.quantity > 0 ? '+' : ''}
                {formatQty(movement.quantity)} {unit}
              </div>
              <div role="cell" className="text-right text-muted">{formatMoney(movement.unitCost)}</div>
              <div role="cell" className="text-right text-ink">
                {formatQty(movement.stockAfter)} {unit}
              </div>
              <div role="cell" className="min-w-0 text-muted">{movement.note}</div>
              <div role="cell" className="truncate text-muted">{movement.userName}</div>
            </div>
          );
        })}

        {movements.length === 0 && (
          <p role="row" className="px-5 py-12 text-center text-muted">
            <span role="cell">No hay movimientos que mostrar.</span>
          </p>
        )}
      </div>
    </div>
  );
}
