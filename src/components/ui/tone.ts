import { Ingredient } from '@/types';
import { MarginStatus, marginStatus } from '@/lib/costing';

// Semáforo compartido por márgenes y stock.
export type Tone = 'ok' | 'warn' | 'bad';

export const TONE_TEXT: Record<Tone, string> = { ok: 'text-ok', warn: 'text-warn', bad: 'text-bad' };
export const TONE_FILL: Record<Tone, string> = { ok: 'bg-ok', warn: 'bg-warn', bad: 'bg-bad' };
export const TONE_BADGE: Record<Tone, string> = {
  ok: 'bg-ok/10 text-ok',
  warn: 'bg-warn/10 text-warn',
  bad: 'bg-bad/10 text-bad',
};

const MARGIN_TONE: Record<MarginStatus, Tone> = { optimal: 'ok', review: 'warn', critical: 'bad' };

export function marginTone(percentage: number): Tone {
  return MARGIN_TONE[marginStatus(percentage)];
}

// Crítico en el mínimo o por debajo; "revisar" hasta 1.5 veces el mínimo, para avisar
// antes de que falte.
export function stockTone(product: Ingredient): Tone {
  if (product.currentStock <= product.minStock) return 'bad';
  if (product.currentStock <= product.minStock * 1.5) return 'warn';
  return 'ok';
}
