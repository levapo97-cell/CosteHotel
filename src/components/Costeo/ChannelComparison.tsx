import { ChannelAnalysis, CostAnalysis } from '@/types';
import { DEFAULT_CHANNELS, formatMoney } from '@/lib/costing';
import { formatPercent } from '@/components/ui/format';
import { TONE_TEXT, marginTone } from '@/components/ui/tone';

const sum = (rows: ChannelAnalysis[], pick: (row: ChannelAnalysis) => number) => rows.reduce((total, row) => total + pick(row), 0);

// Tabla agregada: una fila por canal con la suma de todos los platos del área.
export function ChannelTable({ analyses }: { analyses: CostAnalysis[] }) {
  const rows = DEFAULT_CHANNELS.map((channel) => {
    const matches = analyses
      .map((analysis) => analysis.channels.find((c) => c.channelId === channel.id))
      .filter((c): c is ChannelAnalysis => c !== undefined);
    if (matches.length === 0) return null;

    const priceWithoutTax = sum(matches, (c) => c.priceWithoutTax);
    const commission = sum(matches, (c) => c.commission);
    const cost = sum(matches, (c) => c.cost);
    const grossMargin = sum(matches, (c) => c.grossMargin);
    const grossMarginPercent = priceWithoutTax > 0 ? (grossMargin / priceWithoutTax) * 100 : 0;

    return {
      channel,
      count: matches.length,
      priceWithoutTax,
      commission,
      cost,
      grossMargin,
      grossMarginPercent,
      suggestedPriceWithTax: sum(matches, (c) => c.suggestedPriceWithTax),
    };
  }).filter((row): row is NonNullable<typeof row> => row !== null);

  if (rows.length === 0) {
    return <p className="text-[13px] text-muted">Sin platos que comparar en esta área.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-[11px] tracking-wide text-muted uppercase">
            <th className="py-2 pr-3 font-medium">Canal</th>
            <th className="py-2 pr-3 text-right font-medium">Venta sin IVA</th>
            <th className="py-2 pr-3 text-right font-medium">Comisión</th>
            <th className="py-2 pr-3 text-right font-medium">Coste</th>
            <th className="py-2 pr-3 text-right font-medium">Margen bruto</th>
            <th className="py-2 pr-3 text-right font-medium">% Margen</th>
            <th className="py-2 text-right font-medium">Precio sugerido</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ channel, count, priceWithoutTax, commission, cost, grossMargin, grossMarginPercent, suggestedPriceWithTax }) => {
            const tone = marginTone(grossMarginPercent);
            return (
              <tr key={channel.id} className="border-b border-line last:border-0">
                <td className="py-2.5 pr-3">
                  <p className="font-medium text-ink">{channel.name}</p>
                  <p className="text-xs text-muted">
                    {channel.description} · {count} {count === 1 ? 'plato' : 'platos'}
                  </p>
                </td>
                <td className="py-2.5 pr-3 text-right tabular-nums">{formatMoney(priceWithoutTax)}</td>
                <td className="py-2.5 pr-3 text-right tabular-nums">{formatMoney(commission)}</td>
                <td className="py-2.5 pr-3 text-right tabular-nums">{formatMoney(cost)}</td>
                <td className={`py-2.5 pr-3 text-right font-semibold tabular-nums ${TONE_TEXT[tone]}`}>{formatMoney(grossMargin)}</td>
                <td className={`py-2.5 pr-3 text-right font-semibold tabular-nums ${TONE_TEXT[tone]}`}>{formatPercent(grossMarginPercent)}</td>
                <td className="py-2.5 text-right tabular-nums">{suggestedPriceWithTax > 0 ? formatMoney(suggestedPriceWithTax) : '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Lista compacta por plato (para el preview del formulario, que vive en un panel angosto).
export function ChannelList({ analysis }: { analysis: CostAnalysis }) {
  return (
    <ul>
      {analysis.channels.map((channel) => {
        const tone = marginTone(channel.grossMarginPercent);
        return (
          <li key={channel.channelId} className="flex items-center justify-between gap-3 border-t border-line py-2 text-[13px] first:border-t-0">
            <div className="min-w-0">
              <p className="font-medium text-ink">{channel.channelName}</p>
              <p className="text-xs text-muted">
                Comisión {formatMoney(channel.commission)} · Food cost {formatPercent(channel.foodCostPercent)}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className={`font-semibold ${TONE_TEXT[tone]}`}>
                {formatPercent(channel.grossMarginPercent)} · {formatMoney(channel.grossMargin)}
              </p>
              <p className="text-xs text-muted">
                Sugerido {channel.suggestedPriceWithTax > 0 ? formatMoney(channel.suggestedPriceWithTax) : '—'}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
