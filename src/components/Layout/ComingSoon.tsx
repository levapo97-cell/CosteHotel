import { Check, Hourglass } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/Card';
import { PageHeader } from './PageHeader';
import { ProtectedPage } from './ProtectedPage';

interface ComingSoonProps {
  title: string;
  description: string;
  features: string[];
}

export function ComingSoon({ title, description, features }: ComingSoonProps) {
  return (
    <ProtectedPage>
      <PageHeader title={title} description={description} />
      <Card className="max-w-2xl p-6">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-control bg-surface text-gold">
            <Hourglass size={20} />
          </span>
          <CardTitle>En preparación</CardTitle>
        </div>
        <p className="mt-3 text-muted">Este módulo todavía no está disponible. Lo que incluirá:</p>
        <ul className="mt-4 space-y-2">
          {features.map((feature) => (
            <li key={feature} className="flex gap-2 text-ink">
              <Check size={16} className="mt-0.5 shrink-0 text-ok" />
              {feature}
            </li>
          ))}
        </ul>
      </Card>
    </ProtectedPage>
  );
}
