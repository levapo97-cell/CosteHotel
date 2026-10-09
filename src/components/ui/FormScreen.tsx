'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/Layout/PageHeader';
import { buttonClass } from '@/components/ui/Button';

interface FormScreenProps {
  title: string;
  description?: string;
  backHref: string;
  formId: string;
  submitLabel: string;
  children: ReactNode;
}

// Formulario a página completa (reemplaza al panel lateral): un volver arriba, la tarjeta
// del formulario y las acciones al pie. El envío lo dispara el <form id={formId}> del hijo.
export function FormScreen({ title, description, backHref, formId, submitLabel, children }: FormScreenProps) {
  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={backHref}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <ArrowLeft size={16} />
        Volver
      </Link>

      <PageHeader title={title} description={description} />

      <div className="rounded-card border border-line bg-page p-6 shadow-card sm:p-8">{children}</div>

      <div className="mt-6 flex justify-end gap-3">
        <Link href={backHref} className={buttonClass('outline')}>
          Cancelar
        </Link>
        <button type="submit" form={formId} className={buttonClass('primary')}>
          {submitLabel}
        </button>
      </div>
    </div>
  );
}
