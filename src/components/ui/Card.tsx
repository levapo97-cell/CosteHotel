import { ReactNode } from 'react';
import { TONE_TEXT, Tone } from './tone';

interface CardProps {
  children: ReactNode;
  className?: string;
}

// Tarjeta plana minimalista: borde fino, sin sombra. La separación la da el espacio.
export function Card({ children, className = '' }: CardProps) {
  return <div className={`rounded-card border border-line bg-page ${className}`}>{children}</div>;
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

// KPI minimalista: etiqueta discreta, cifra grande que lleva el color de estado,
// nota breve. Sin adornos: el dato es el protagonista.
export function KpiCard({ label, value, note, tone }: KpiCardProps) {
  return (
    <Card className="p-5">
      <p className="text-[10px] font-semibold tracking-[0.1em] text-muted uppercase">{label}</p>
      <p className={`mt-3 text-[28px] leading-none font-semibold tracking-[-0.02em] tabular-nums ${tone ? TONE_TEXT[tone] : 'text-ink'}`}>
        {value}
      </p>
      {note && <p className="mt-2.5 text-xs leading-snug text-muted">{note}</p>}
    </Card>
  );
}

// Grid de KPIs que se reacomoda solo: tantas columnas de 210px como quepan.
export function KpiGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-4">{children}</div>;
}
