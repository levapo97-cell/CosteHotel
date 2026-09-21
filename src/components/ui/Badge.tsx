import { ReactNode } from 'react';
import { TONE_BADGE, TONE_FILL, Tone } from './tone';

type BadgeTone = Tone | 'gold' | 'neutral';

const BADGE: Record<BadgeTone, string> = {
  ...TONE_BADGE,
  gold: 'bg-gold/10 text-gold',
  neutral: 'bg-ink/[0.05] text-muted',
};

export function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-chip px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${BADGE[tone]}`}>
      {children}
    </span>
  );
}

// Barra de 5px; `value` va de 0 a 1.
export function ProgressBar({ value, tone, label }: { value: number; tone: Tone; label: string }) {
  const percent = Math.round(Math.min(Math.max(value, 0), 1) * 100);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-[5px] w-full overflow-hidden rounded-full bg-line"
    >
      <div className={`h-full rounded-full ${TONE_FILL[tone]}`} style={{ width: `${percent}%` }} />
    </div>
  );
}
