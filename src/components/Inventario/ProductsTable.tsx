'use client';

import { useState } from 'react';
import { ArrowDown, ArrowLeftRight, ArrowUp, Pencil, Search, Trash2, TriangleAlert } from 'lucide-react';
import { Ingredient, StockMovement } from '@/types';
import { UNIT_LABELS, formatMoney } from '@/lib/costing';
import { formatQty, isLowStock } from '@/lib/inventory';
import { lastCostChange } from '@/components/Costeo/costChanges';
import { Badge, ProgressBar } from '@/components/ui/Badge';
import { buttonClass } from '@/components/ui/Button';
import { inputClass } from '@/components/ui/Form';
import { formatDay, formatPercent } from '@/components/ui/format';
import { TONE_TEXT, stockTone } from '@/components/ui/tone';

type SortKey = 'name' | 'cost' | 'value';

// Anchos mínimos por columna + min-width en la fila: en pantallas angostas la tabla se
// desplaza horizontalmente en vez de apretar las columnas.
const GRID =
  'grid min-w-[760px] grid-cols-[minmax(180px,2fr)_minmax(120px,1fr)_minmax(150px,1.3fr)_minmax(96px,0.9fr)_minmax(84px,0.7fr)_minmax(112px,auto)] items-center gap-x-4 px-5';

interface ProductsTableProps {
  products: Ingredient[];
  movements: StockMovement[];
  usageCount: (id: string) => number;
  onMove: (product: Ingredient) => void;
  onEdit: (product: Ingredient) => void;
  onDelete: (product: Ingredient) => void;
}

export function ProductsTable({ products, movements, usageCount, onMove, onEdit, onDelete }: ProductsTableProps) {
  const [search, setSearch] = useState('');
  const [onlyLow, setOnlyLow] = useState(false);
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'name', dir: 'asc' });

  const query = search.trim().toLowerCase();
  const sortValue = (p: Ingredient) =>
    sort.key === 'name' ? p.name : sort.key === 'cost' ? p.costPerUnit : p.costPerUnit * p.currentStock;
  const visible = products
    .filter((p) => p.name.toLowerCase().includes(query) && (!onlyLow || isLowStock(p)))
    .sort((a, b) => {
      const [x, y] = [sortValue(a), sortValue(b)];
      const order = typeof x === 'string' ? x.localeCompare(y as string, 'es') : x - (y as number);
      return sort.dir === 'asc' ? order : -order;
    });

  const toggleSort = (key: SortKey) =>
    setSort((current) => ({ key, dir: current.key === key && current.dir === 'asc' ? 'desc' : 'asc' }));

  const sortHeader = (label: string, sortKey: SortKey, align: 'left' | 'right' = 'left') => {
    const active = sort.key === sortKey;
    const Arrow = sort.dir === 'asc' ? ArrowUp : ArrowDown;
    return (
      <div role="columnheader" aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
        <button
          type="button"
          onClick={() => toggleSort(sortKey)}
          className={`flex w-full items-center gap-1 tracking-wide uppercase hover:text-ink ${align === 'right' ? 'justify-end' : ''} ${active ? 'text-ink' : ''}`}
        >
          {label}
          {active && <Arrow size={13} aria-hidden />}
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto"
            aria-label="Buscar producto"
            className={`${inputClass()} pl-9`}
          />
        </div>
        <button
          type="button"
          onClick={() => setOnlyLow((value) => !value)}
          aria-pressed={onlyLow}
          className={`inline-flex items-center gap-2 rounded-control border px-4 py-2.5 text-sm font-medium transition-colors ${
            onlyLow ? 'border-bad bg-bad/10 text-bad' : 'border-line text-ink hover:bg-ink/[0.04]'
          }`}
        >
          <TriangleAlert size={16} />
          Solo bajo mínimo
        </button>
        <p className="ml-auto text-xs text-muted">
          {visible.length} de {products.length} productos
        </p>
      </div>

      <div className="overflow-x-auto rounded-card border border-line">
        <div role="table" aria-label="Productos" aria-rowcount={visible.length + 1}>
          <div
            role="row"
            className={`${GRID} border-b border-line bg-surface py-3 text-xs font-semibold tracking-wide text-muted uppercase`}
          >
            {sortHeader('Producto', 'name')}
            {sortHeader('Costo / unidad', 'cost', 'right')}
            <div role="columnheader">Stock vs mínimo</div>
            {sortHeader('Valor', 'value', 'right')}
            <div role="columnheader" className="text-right">
              Recetas
            </div>
            <div role="columnheader" className="text-right">
              Acciones
            </div>
          </div>

          {visible.map((product) => {
            const unit = UNIT_LABELS[product.unitType];
            const tone = stockTone(product);
            const change = lastCostChange(product, movements);
            const usedIn = usageCount(product.id);
            // La barra llega al 100% con el doble del mínimo: debajo de la mitad ya está en crítico.
            const fill = product.minStock > 0 ? product.currentStock / (product.minStock * 2) : 1;
            return (
              <div role="row" key={product.id} className={`${GRID} border-b border-line py-3 last:border-b-0 hover:bg-surface/60`}>
                <div role="cell" className="min-w-0">
                  <p className="truncate font-medium text-ink">{product.name}</p>
                  {(product.category || product.supplier) && (
                    <p className="truncate text-[11px] text-muted">
                      {[product.category, product.supplier].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  <p className="text-[11px] text-muted">Actualizado {formatDay(product.lastUpdated)}</p>
                </div>
                <div role="cell" className="text-right">
                  <p className="text-ink">
                    {formatMoney(product.costPerUnit)} <span className="text-muted">/ {unit}</span>
                  </p>
                  {change && Math.abs(change.percent) >= 0.05 && (
                    <p className={`text-[11px] font-semibold ${change.percent > 0 ? 'text-bad' : 'text-ok'}`}>
                      {change.percent > 0 ? '▲' : '▼'} {formatPercent(Math.abs(change.percent))}
                      <span className="sr-only"> respecto a la compra anterior</span>
                    </p>
                  )}
                </div>
                <div role="cell" className="min-w-0 space-y-1.5">
                  <p className="flex items-center gap-2">
                    <span className={`font-semibold ${TONE_TEXT[tone]}`}>
                      {formatQty(product.currentStock)} {unit}
                    </span>
                    {isLowStock(product) && <Badge tone="bad">Bajo</Badge>}
                  </p>
                  <ProgressBar value={fill} tone={tone} label={`Stock de ${product.name} respecto al mínimo`} />
                  <p className="text-[11px] text-muted">
                    mín {formatQty(product.minStock)} {unit}
                  </p>
                </div>
                <div role="cell" className="text-right font-semibold text-ink">
                  {formatMoney(product.costPerUnit * product.currentStock)}
                </div>
                <div role="cell" className={`text-right ${usedIn > 0 ? 'text-ink' : 'text-muted'}`}>
                  {usedIn > 0 ? usedIn : 'ninguna'}
                </div>
                <div role="cell" className="flex justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => onMove(product)}
                    aria-label={`Registrar movimiento de ${product.name}`}
                    title="Registrar movimiento"
                    className={buttonClass('icon')}
                  >
                    <ArrowLeftRight size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(product)}
                    aria-label={`Editar ${product.name}`}
                    title="Editar"
                    className={buttonClass('icon')}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(product)}
                    disabled={usedIn > 0}
                    aria-label={`Eliminar ${product.name}`}
                    title={usedIn > 0 ? `No se puede eliminar: se usa en ${usedIn} receta(s)` : 'Eliminar'}
                    className={buttonClass('icon-danger')}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}

          {visible.length === 0 && (
            <p role="row" className="px-5 py-12 text-center text-muted">
              <span role="cell">
                {products.length === 0 ? 'Aún no hay productos en esta área.' : 'Ningún producto coincide con el filtro.'}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
