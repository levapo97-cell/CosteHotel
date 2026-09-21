// Días en formato 'YYYY-MM-DD' (como `lastUpdated`). Se arma la fecha en hora local:
// `new Date('2026-09-15')` la interpreta en UTC y puede mostrar el día anterior.
const dayFormatter = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', year: 'numeric' });

export function formatDay(isoDay: string): string {
  const [year, month, day] = isoDay.split('-').map(Number);
  return dayFormatter.format(new Date(year, month - 1, day));
}

// El store guarda `lastUpdated` con la fecha UTC, así que se compara contra la misma.
export function isToday(isoDay: string): boolean {
  return isoDay === new Date().toISOString().split('T')[0];
}

export function formatPercent(value: number, withSign = false): string {
  const text = `${Math.abs(value).toFixed(1)}%`;
  if (!withSign) return `${value < 0 ? '-' : ''}${text}`;
  return `${value > 0 ? '+' : value < 0 ? '−' : ''}${text}`;
}
