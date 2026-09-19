import { ReactNode, SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

export function inputClass(error?: string) {
  return `w-full rounded-lg border px-3 py-2 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-blue-600 ${
    error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
  }`;
}

// Select sin la apariencia nativa del navegador: misma altura y padding que los inputs.
export function Select({ className = '', children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={`relative ${className}`}>
      <select {...props} className={`${inputClass()} cursor-pointer appearance-none pr-9`}>
        {children}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-400"
      />
    </div>
  );
}

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, error, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

const STAT_TONES = {
  blue: 'bg-blue-50 border-blue-200',
  green: 'bg-green-50 border-green-200',
  purple: 'bg-purple-50 border-purple-200',
  yellow: 'bg-yellow-50 border-yellow-200',
  red: 'bg-red-50 border-red-200',
};

interface StatBoxProps {
  label: string;
  value: ReactNode;
  hint?: string;
  tone: keyof typeof STAT_TONES;
}

export function StatBox({ label, value, hint, tone }: StatBoxProps) {
  return (
    <div className={`rounded-lg border p-4 ${STAT_TONES[tone]}`}>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
