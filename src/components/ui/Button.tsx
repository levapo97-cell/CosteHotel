import { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'outline' | 'neutral' | 'icon' | 'icon-danger';

const VARIANTS: Record<Variant, string> = {
  primary:
    'rounded-control bg-accent px-4 py-2.5 font-semibold text-on-accent hover:bg-accent-hover disabled:bg-line disabled:text-muted',
  outline:
    'rounded-control border border-accent px-4 py-2.5 font-semibold text-accent-text hover:bg-accent/5 disabled:border-line disabled:text-muted',
  neutral:
    'rounded-control border border-line px-4 py-2.5 font-medium text-ink hover:bg-ink/[0.04] disabled:text-muted',
  icon: 'rounded-chip p-2 text-muted hover:bg-ink/[0.04] hover:text-ink',
  'icon-danger': 'rounded-chip p-2 text-muted hover:bg-bad/10 hover:text-bad disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-muted',
};

// Feedback de pulsación (emil-design-eng): scale(0.97) en :active, propiedades
// explícitas (nunca transition-all) y sin transform con movimiento reducido.
export function buttonClass(variant: Variant = 'primary', extra = '') {
  return `inline-flex items-center justify-center gap-2 text-sm transition-[color,background-color,border-color,transform] duration-150 ease-out active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:active:scale-100 motion-reduce:transition-none motion-reduce:active:scale-100 ${VARIANTS[variant]} ${extra}`;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = 'primary', className = '', type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, className)} {...props} />;
}
