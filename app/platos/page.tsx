'use client';

import { ProtectedPage } from '@/components/Layout/ProtectedPage';
import { DishesView } from '@/components/Platos/DishesView';

export default function PlatosPage() {
  return (
    <ProtectedPage>
      <DishesView />
    </ProtectedPage>
  );
}
