'use client';

import { ProtectedPage } from '@/components/Layout/ProtectedPage';
import { InventoryView } from '@/components/Inventario/InventoryView';

export default function InventarioPage() {
  return (
    <ProtectedPage>
      <InventoryView />
    </ProtectedPage>
  );
}
