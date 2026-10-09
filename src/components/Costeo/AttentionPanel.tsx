'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowRight, Check, CircleAlert, Info } from 'lucide-react';
import { MARGIN_REVIEW, UNIT_LABELS, formatMoney } from '@/lib/costing';
import { formatQty, isLowStock } from '@/lib/inventory';
import { lastCostChange, referenceDeviation } from '@/components/Costeo/costChanges';
import { useWorkspaceData } from '@/components/Workspace/useWorkspaceData';
import { formatPercent } from '@/components/ui/format';
import { Card } from '@/components/ui/Card';

type Severity = 'bad' | 'warn' | 'info';

interface Alert {
  id: string;
  severity: Severity;
  text: string;
  actionLabel: string;
  href: string;
}

// Umbral de subida de costo que merece una alerta (vs. la compra anterior).
const COST_SPIKE_PERCENT = 10;
const MAX_VISIBLE = 8;

const ICON: Record<Severity, typeof CircleAlert> = { bad: CircleAlert, warn: AlertTriangle, info: Info };
const TONE: Record<Severity, string> = { bad: 'text-bad', warn: 'text-warn', info: 'text-muted' };
const RANK: Record<Severity, number> = { bad: 0, warn: 1, info: 2 };

// Panel "Necesita tu atención": reúne lo accionable que la app ya calcula —recetas que no
// se pueden costear, márgenes bajos, subidas de costo, stock bajo mínimo y capital
// inmovilizado— y lleva a donde se arregla. Inspirado en Alexia, adaptado a nuestro modelo.
export function AttentionPanel() {
  const router = useRouter();
  const { products, recipes, movements, usageCount } = useWorkspaceData();
  const [expanded, setExpanded] = useState(false);

  const alerts: Alert[] = [];

  for (const { dish, analysis } of recipes) {
    if (analysis.warnings.length > 0) {
      alerts.push({
        id: `warn-${dish.id}`,
        severity: 'bad',
        text: `${dish.name}: no se puede costear — ${analysis.warnings[0]}`,
        actionLabel: 'Revisar',
        href: `/platos/${dish.id}`,
      });
    } else if (analysis.marginPercentage <= MARGIN_REVIEW) {
      alerts.push({
        id: `margin-${dish.id}`,
        severity: 'bad',
        text: `${dish.name}: margen ${formatPercent(analysis.marginPercentage)}, por debajo del ${MARGIN_REVIEW}%`,
        actionLabel: 'Revisar',
        href: `/platos/${dish.id}`,
      });
    }
  }

  const flaggedCost = new Set<string>();
  for (const product of products) {
    const change = lastCostChange(product, movements);
    if (change && change.percent >= COST_SPIKE_PERCENT) {
      flaggedCost.add(product.id);
      alerts.push({
        id: `cost-${product.id}`,
        severity: 'warn',
        text: `${product.name}: el costo subió ${formatPercent(change.percent)} en la última compra`,
        actionLabel: 'Ver producto',
        href: `/inventario/productos/${product.id}`,
      });
    }
  }

  // Desviación persistente frente al coste de referencia aceptado (subida de proveedor
  // que aún no se ha "aceptado"). No se repite si ya avisamos de la última compra.
  for (const product of products) {
    if (flaggedCost.has(product.id)) continue;
    const dev = referenceDeviation(product);
    if (dev && dev.percent >= COST_SPIKE_PERCENT) {
      alerts.push({
        id: `ref-${product.id}`,
        severity: 'warn',
        text: `${product.name}: ${formatPercent(dev.percent)} sobre el coste de referencia — revisa y acepta o renegocia`,
        actionLabel: 'Ver producto',
        href: `/inventario/productos/${product.id}`,
      });
    }
  }

  for (const product of products) {
    if (isLowStock(product)) {
      const unit = UNIT_LABELS[product.unitType];
      alerts.push({
        id: `stock-${product.id}`,
        severity: 'warn',
        text: `${product.name}: stock bajo mínimo (${formatQty(product.currentStock)} ${unit} ≤ mín ${formatQty(product.minStock)} ${unit})`,
        actionLabel: 'Reponer',
        href: `/inventario/movimientos/nuevo?producto=${product.id}`,
      });
    }
  }

  for (const product of products) {
    const value = product.costPerUnit * product.currentStock;
    if (usageCount(product.id) === 0 && value > 0) {
      alerts.push({
        id: `idle-${product.id}`,
        severity: 'info',
        text: `${product.name}: no se usa en ninguna receta (${formatMoney(value)} inmovilizado)`,
        actionLabel: 'Ver producto',
        href: `/inventario/productos/${product.id}`,
      });
    }
  }

  alerts.sort((a, b) => RANK[a.severity] - RANK[b.severity]);

  if (alerts.length === 0) {
    return (
      <Card className="flex items-center gap-3 p-4">
        <Check size={18} className="shrink-0 text-ok" />
        <p className="text-sm text-ink">
          Todo en orden: sin recetas sin costear, márgenes bajos, subidas de costo ni stock bajo mínimo.
        </p>
      </Card>
    );
  }

  const visible = expanded ? alerts : alerts.slice(0, MAX_VISIBLE);

  return (
    <Card className="p-5">
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <h2 className="font-display text-card-title font-semibold text-ink">Necesita tu atención</h2>
        <span className="text-sm font-semibold tabular-nums text-bad">{alerts.length}</span>
      </div>
      <p className="mb-4 text-[13px] text-muted">
        Recetas que no se pueden costear, márgenes por debajo del mínimo, subidas de costo y stock bajo. Cada aviso lleva
        a donde se arregla.
      </p>

      <ul className="divide-y divide-line">
        {visible.map((alert) => {
          const Icon = ICON[alert.severity];
          return (
            <li key={alert.id} className="flex items-center gap-3 py-2.5">
              <Icon size={16} className={`shrink-0 ${TONE[alert.severity]}`} />
              <p className="min-w-0 flex-1 text-[13px] text-ink">{alert.text}</p>
              <button
                type="button"
                onClick={() => router.push(alert.href)}
                className="flex shrink-0 items-center gap-1 text-[13px] font-medium text-accent-text hover:text-accent-hover"
              >
                {alert.actionLabel}
                <ArrowRight size={14} />
              </button>
            </li>
          );
        })}
      </ul>

      {alerts.length > MAX_VISIBLE && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-3 text-[13px] font-medium text-accent-text hover:text-accent-hover"
        >
          {expanded ? 'Ver menos' : `Ver ${alerts.length - MAX_VISIBLE} más`}
        </button>
      )}
    </Card>
  );
}
