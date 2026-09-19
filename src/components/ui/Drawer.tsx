'use client';

import { ReactNode, useEffect, useEffectEvent, useId, useRef } from 'react';
import { X } from 'lucide-react';

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
    <div
      inert={!open}
      className={`fixed inset-0 z-50 overflow-hidden ${open ? '' : 'pointer-events-none'}`}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-gray-900/40 backdrop-blur-[2px] transition-opacity duration-500 motion-reduce:transition-none ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`absolute inset-y-0 right-0 flex w-full max-w-lg flex-col bg-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-gray-900">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <X size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <footer className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
