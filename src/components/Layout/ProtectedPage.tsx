'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { MainLayout } from './MainLayout';

// Sin sesión vuelve al login; la sesión vive en memoria, así que recargar también lleva allí.
export function ProtectedPage({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push('/');
  }, [user, router]);

  if (!user) return null;
  return <MainLayout>{children}</MainLayout>;
}
