'use client';

import { ReactNode, useEffect, useEffectEvent, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { buttonClass } from './Button';

interface DrawerProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

// Panel lateral derecho. Se mantiene montado y se desliza con CSS, así la animación
// de salida se ve completa sin timers. Cerrado queda `inert` (sin foco ni clics).
export function Drawer({ open, title, description, onClose, children, footer }: DrawerProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const handleEscape = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === 'Escape') onClose();
  });

  useEffect(() => {
    if (!open) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);
    panelRef.current
      ?.querySelector<HTMLElement>('input, select, textarea')
      ?.focus({ preventScroll: true });

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleEscape);
      previousFocus?.focus({ preventScroll: true });
    };
  }, [open]);

  return (
    <div inert={!open} className={`fixed inset-0 z-50 overflow-hidden ${open ? '' : 'pointer-events-none'}`}>
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-ink/35 transition-opacity duration-[260ms] motion-reduce:transition-none ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`absolute inset-y-0 right-0 flex w-[min(420px,92vw)] flex-col border-l border-line bg-page transition-[translate,box-shadow] duration-[260ms] ease-out motion-reduce:transition-none ${
          // Sin sombra cerrado: el panel queda fuera de pantalla pero su sombra se proyectaría hacia adentro.
          open ? 'translate-x-0 shadow-drawer' : 'translate-x-full'
        }`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div className="min-w-0">
            <h2 id={titleId} className="font-display text-card-title font-semibold text-ink">
              {title}
            </h2>
            {description && <p className="mt-1 text-[13px] text-pretty text-muted">{description}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className={buttonClass('icon', '-mr-2')}>
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer && <footer className="flex justify-end gap-3 border-t border-line px-6 py-4">{footer}</footer>}
      </div>
    </div>
  );
}

// Pie estándar: "Cancelar" outline y el envío del formulario (`formId`) relleno.
export function DrawerActions({ formId, submitLabel, onCancel }: { formId: string; submitLabel: string; onCancel: () => void }) {
  return (
    <>
      <button type="button" onClick={onCancel} className={buttonClass('outline')}>
        Cancelar
      </button>
      <button type="submit" form={formId} className={buttonClass('primary')}>
        {submitLabel}
      </button>
    </>
  );
}
