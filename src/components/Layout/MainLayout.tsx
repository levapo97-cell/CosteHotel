'use client';

import { Sidebar } from '@/components/Navigation/Sidebar';
import { ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 flex-1 bg-slate-50 min-h-screen">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
