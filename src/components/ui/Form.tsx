import { ReactNode, SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

export function inputClass(error?: string) {
  return `w-full rounded-control border bg-page px-3 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 ${
    error ? 'border-bad' : 'border-line'
  }`;
}

// Select sin la apariencia nativa del navegador: misma altura y padding que los inputs.
export function Select({ className = '', children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={`relative min-w-0 ${className}`}>
      <select {...props} className={`${inputClass()} cursor-pointer appearance-none pr-9`}>
        {children}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted" />
    </div>
  );
}

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, error, hint, children }: FieldProps) {
  return (
    <div className="min-w-0">
      <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium text-ink">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && <p className="mt-1 text-xs font-medium text-bad">{error}</p>}
    </div>
  );
}

interface SegmentedProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string; icon?: ReactNode }[];
  onChange: (value: T) => void;
  className?: string;
}

// Control segmentado: la opción activa va rellena de acento.
export function Segmented<T extends string>({ label, value, options, onChange, className = '' }: SegmentedProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className={`flex rounded-control border border-line bg-page p-1 ${className}`}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-chip px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
              active ? 'bg-accent text-on-accent' : 'text-muted hover:text-ink'
            }`}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

// Nota informativa en dorado suave (datos que conviene saber antes de guardar).
export function InfoNote({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex gap-2.5 rounded-control border border-gold/25 bg-gold/[0.08] p-3 text-[13px] text-ink">
      {icon && <span className="mt-0.5 shrink-0 text-gold">{icon}</span>}
      <div className="min-w-0">{children}</div>
    </div>
  );
}
