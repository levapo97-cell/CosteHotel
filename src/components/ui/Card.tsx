import { ReactNode } from 'react';
import { TONE_TEXT, Tone } from './tone';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return <div className={`rounded-card border border-line bg-page shadow-card ${className}`}>{children}</div>;
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <h2 className="font-display text-card-title font-semibold text-ink">{children}</h2>;
}

interface KpiCardProps {
  label: string;
  value: ReactNode;
  note?: ReactNode;
  tone?: Tone;
}

export function KpiCard({ label, value, note, tone }: KpiCardProps) {
  return (
    <Card className="p-5">
      <p className="text-xs font-medium tracking-wide text-muted uppercase">{label}</p>
      <p className={`mt-2 text-[28px] leading-tight font-semibold ${tone ? TONE_TEXT[tone] : 'text-ink'}`}>{value}</p>
      {note && <p className="mt-1 text-xs text-muted">{note}</p>}
    </Card>
  );
}

// Grid de KPIs que se reacomoda solo: tantas columnas de 210px como quepan.
export function KpiGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-4">{children}</div>;
}
