import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

// Encabezado minimalista: el título habla por sí solo. El contexto de hotel y área
// ya vive en la barra superior, así que aquí no se repite.
export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="min-w-0">
        <h1 className="font-display text-[30px] leading-[1.08] font-semibold tracking-[-0.015em] text-ink sm:text-page-title">{title}</h1>
        {description && <p className="mt-3 max-w-[62ch] text-body text-pretty text-muted">{description}</p>}
      </div>
      {action && <div className="flex flex-wrap gap-3">{action}</div>}
    </div>
  );
}
