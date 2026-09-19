import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-gray-200 pb-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">{title}</h1>
        {description && <p className="text-gray-600">{description}</p>}
      </div>
      {actions}
    </div>
  );
}
