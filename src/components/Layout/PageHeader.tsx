'use client';

import { ReactNode } from 'react';
import { useWorkspaceData } from '@/components/Workspace/useWorkspaceData';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  const { hotelName, copy } = useWorkspaceData();

  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="min-w-0">
        <p className="mb-2 text-[11px] font-semibold tracking-[0.14em] text-gold uppercase">
          {hotelName} · {copy.label}
        </p>
        <h1 className="font-display text-[30px] leading-tight font-semibold text-ink sm:text-page-title">{title}</h1>
        {description && <p className="mt-2 max-w-[60ch] text-body text-pretty text-muted">{description}</p>}
      </div>
      {action && <div className="flex flex-wrap gap-3">{action}</div>}
    </div>
  );
}
