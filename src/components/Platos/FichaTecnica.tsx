'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { CostAnalysis, Dish, Ingredient } from '@/types';
import { BreakdownLine, UNIT_LABELS, formatMoney, recipeBreakdown } from '@/lib/costing';
import { effectiveAllergens } from '@/lib/allergens';
import { formatPercent } from '@/components/ui/format';
import { formatQty } from '@/lib/inventory';
import { buttonClass } from '@/components/ui/Button';
import { AllergenChips } from '@/components/ui/AllergenPicker';

interface FichaTecnicaProps {
  dish: Dish;
  analysis: CostAnalysis;
  products: Ingredient[];
  catalog: Dish[];
  areaLabel: string;
  hotelName: string;
  onClose: () => void;
}

function LineRows({ lines, showWaste, total }: { lines: BreakdownLine[]; showWaste: boolean; total: number }) {
  return (
    <>
      {lines.map((line, index) => (
        <tr key={index} className="border-b border-line last:border-0">
          <td className="py-1.5 pr-3">{line.name}</td>
          <td className="py-1.5 pr-3 text-right tabular-nums">
            {formatQty(line.netQuantity)} {UNIT_LABELS[line.unit]}
          </td>
          {showWaste && <td className="py-1.5 pr-3 text-right tabular-nums">{line.wastePercent > 0 ? `${line.wastePercent}%` : '—'}</td>}
          {showWaste && (
            <td className="py-1.5 pr-3 text-right tabular-nums">
              {formatQty(line.grossQuantity)} {UNIT_LABELS[line.unit]}
            </td>
          )}
          <td className="py-1.5 pr-3 text-right font-medium tabular-nums text-ink">{formatMoney(line.cost)}</td>
          <td className="py-1.5 text-right tabular-nums text-muted">{total > 0 ? formatPercent((line.cost / total) * 100) : '—'}</td>
        </tr>
      ))}
    </>
  );
}

// Ficha técnica imprimible (§28). El botón "Descargar ficha (PDF)" usa la impresión
// del navegador (Guardar como PDF); las reglas @media print en globals.css dejan
// visible solo #ficha-print.
export function FichaTecnica({ dish, analysis, products, catalog, areaLabel, hotelName, onClose }: FichaTecnicaProps) {
  const [mounted, setMounted] = useState(false);
  const breakdown = recipeBreakdown(dish, products, catalog);
  const allergens = effectiveAllergens(dish, products, catalog);
  // % del total de cada componente sobre el coste base (ingredientes + subrecetas + empaque).
  const breakdownTotal = breakdown.detail.baseCost;

  // Animación de entrada (emil-design-eng): se activa en el siguiente frame para que
  // la transición de opacidad/escala se ejecute, sin setState síncrono en el efecto.
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const summary: [string, string][] = [
    ['Coste de ingredientes', formatMoney(breakdown.detail.ingredientCost)],
    ['Coste de subrecetas', formatMoney(breakdown.detail.subrecipeCost)],
    ['Coste de empaque', formatMoney(breakdown.detail.packagingCost)],
    ['Coste base', formatMoney(breakdown.detail.baseCost)],
    [`Margen de seguridad (${analysis.safetyMarginPercent}%)`, formatMoney(breakdown.detail.safetyMarginAmount)],
    ['Coste final de la receta', formatMoney(breakdown.detail.finalCost)],
    ['Coste por porción', formatMoney(breakdown.detail.costPerServing)],
  ];

  const info: [string, string][] = [
    ['Código', dish.code || '—'],
    ['Grupo de carta', dish.category || '—'],
    ['Área', areaLabel],
    ['Rendimiento', `${formatQty(analysis.yieldQuantity)} ${UNIT_LABELS[dish.yieldUnit ?? 'unit']}`],
    ['Margen de seguridad', `${analysis.safetyMarginPercent}%`],
    ['IVA', `${analysis.taxRate}%`],
    ['Objetivo food cost', `${analysis.targetFoodCostPercent}%`],
    ['PVP con IVA', formatMoney(analysis.sellingPrice)],
  ];

  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 z-50 flex justify-center overflow-y-auto bg-ink/35 p-4 transition-opacity duration-200 motion-reduce:transition-none sm:p-8 ${
        mounted ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        id="ficha-print"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Ficha técnica de ${dish.name}`}
        className={`my-auto h-fit w-full max-w-[760px] rounded-card border border-line bg-page p-8 shadow-drawer transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none sm:p-10 ${
          mounted ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-1 scale-[0.97] opacity-0'
        }`}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">Ficha técnica · {hotelName}</p>
            <h2 className="mt-1 font-display text-page-title leading-tight font-semibold text-pretty text-ink">{dish.name}</h2>
            {dish.description && <p className="mt-1 max-w-[52ch] text-[13px] text-pretty text-muted">{dish.description}</p>}
          </div>
          <div className="no-print flex shrink-0 gap-1">
            <button type="button" onClick={() => window.print()} className={buttonClass('outline', 'px-3 py-2')}>
              <Download size={16} />
              PDF
            </button>
            <button type="button" onClick={onClose} aria-label="Cerrar" className={buttonClass('icon')}>
              <X size={18} />
            </button>
          </div>
        </div>

        <section className="mb-6 grid grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-4">
          {info.map(([label, value]) => (
            <div key={label}>
              <dt className="text-[11px] tracking-wide text-muted uppercase">{label}</dt>
              <dd className="mt-0.5 font-medium text-ink">{value}</dd>
            </div>
          ))}
        </section>

        <section className="mb-6">
          <h3 className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">Alérgenos</h3>
          <AllergenChips allergens={allergens} />
        </section>

        <section className="mb-6">
          <h3 className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">Detalle del costeo</h3>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line text-left text-[11px] tracking-wide text-muted uppercase">
                <th className="py-1.5 pr-3 font-medium">Componente</th>
                <th className="py-1.5 pr-3 text-right font-medium">Cant. neta</th>
                <th className="py-1.5 pr-3 text-right font-medium">Merma</th>
                <th className="py-1.5 pr-3 text-right font-medium">Cant. bruta</th>
                <th className="py-1.5 pr-3 text-right font-medium">Coste</th>
                <th className="py-1.5 text-right font-medium">% del total</th>
              </tr>
            </thead>
            <tbody>
              <LineRows lines={breakdown.ingredients} showWaste total={breakdownTotal} />
              {breakdown.subrecipes.length > 0 && (
                <tr className="border-b border-line bg-surface/60 text-[11px] tracking-wide text-muted uppercase">
                  <td className="py-1 pr-3" colSpan={6}>Subrecetas</td>
                </tr>
              )}
              <LineRows lines={breakdown.subrecipes} showWaste total={breakdownTotal} />
              {breakdown.packaging.length > 0 && (
                <tr className="border-b border-line bg-surface/60 text-[11px] tracking-wide text-muted uppercase">
                  <td className="py-1 pr-3" colSpan={6}>Empaque</td>
                </tr>
              )}
              <LineRows lines={breakdown.packaging} showWaste total={breakdownTotal} />
            </tbody>
          </table>
        </section>

        <section className="mb-6 grid gap-x-8 gap-y-1.5 rounded-control border border-line bg-surface p-5 sm:grid-cols-2">
          {summary.map(([label, value], index) => (
            <div
              key={label}
              className={`flex items-center justify-between gap-4 text-sm ${
                index >= summary.length - 1 ? 'border-t border-line pt-2 font-semibold text-ink sm:col-span-2' : ''
              }`}
            >
              <span className={index >= summary.length - 1 ? 'text-ink' : 'text-muted'}>{label}</span>
              <span className="tabular-nums">{value}</span>
            </div>
          ))}
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">Rentabilidad por canal</h3>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line text-left text-[11px] tracking-wide text-muted uppercase">
                <th className="py-1.5 pr-3 font-medium">Canal</th>
                <th className="py-1.5 pr-3 text-right font-medium">PVP</th>
                <th className="py-1.5 pr-3 text-right font-medium">Sin IVA</th>
                <th className="py-1.5 pr-3 text-right font-medium">Comisión</th>
                <th className="py-1.5 pr-3 text-right font-medium">Margen</th>
                <th className="py-1.5 pr-3 text-right font-medium">%</th>
                <th className="py-1.5 text-right font-medium">Sugerido</th>
              </tr>
            </thead>
            <tbody>
              {analysis.channels.map((channel) => (
                <tr key={channel.channelId} className="border-b border-line last:border-0">
                  <td className="py-1.5 pr-3 font-medium text-ink">{channel.channelName}</td>
                  <td className="py-1.5 pr-3 text-right tabular-nums">{formatMoney(channel.priceWithTax)}</td>
                  <td className="py-1.5 pr-3 text-right tabular-nums">{formatMoney(channel.priceWithoutTax)}</td>
                  <td className="py-1.5 pr-3 text-right tabular-nums">{formatMoney(channel.commission)}</td>
                  <td className="py-1.5 pr-3 text-right font-medium tabular-nums text-ink">{formatMoney(channel.grossMargin)}</td>
                  <td className="py-1.5 pr-3 text-right tabular-nums">{formatPercent(channel.grossMarginPercent)}</td>
                  <td className="py-1.5 text-right tabular-nums">
                    {channel.suggestedPriceWithTax > 0 ? formatMoney(channel.suggestedPriceWithTax) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
