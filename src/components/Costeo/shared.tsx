import { MARGIN_BADGE, marginStatus } from '@/lib/costing';

export function MarginBadge({ percentage }: { percentage: number }) {
  const badge = MARGIN_BADGE[marginStatus(percentage)];
  return (
    <span className={`inline-block rounded px-2 py-1 text-xs font-semibold ${badge.className}`}>
      {percentage.toFixed(1)}%
    </span>
  );
}
