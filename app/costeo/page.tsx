'use client';

import { ProtectedPage } from '@/components/Layout/ProtectedPage';
import { CosteoView } from '@/components/Costeo/CosteoView';

export default function CosteoPage() {
  return (
    <ProtectedPage>
      <CosteoView />
    </ProtectedPage>
  );
}
