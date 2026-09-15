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
      <main className="ml-72 flex-1 bg-white min-h-screen transition-all duration-300">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
