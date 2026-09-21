'use client';

import { ReactNode, useState } from 'react';
import { Menu } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Sidebar } from '@/components/Navigation/Sidebar';
import { WorkspaceSwitcher } from '@/components/Workspace/WorkspaceSwitcher';
import { useWorkspaceData } from '@/components/Workspace/useWorkspaceData';
import { buttonClass } from '@/components/ui/Button';
import { formatDay, isToday } from '@/components/ui/format';

export function MainLayout({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [navOpen, setNavOpen] = useState(false);

  if (!isAuthenticated) return <>{children}</>;

  return (
    <div className="min-h-screen">
      <Sidebar open={navOpen} onNavigate={() => setNavOpen(false)} />
      {navOpen && (
        <div aria-hidden onClick={() => setNavOpen(false)} className="fixed inset-0 z-30 bg-ink/35 lg:hidden" />
      )}

      <div className="lg:pl-[250px]">
        <Topbar onMenu={() => setNavOpen(true)} />
        <main className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 lg:px-10">{children}</main>
      </div>
    </div>
  );
}

function Topbar({ onMenu }: { onMenu: () => void }) {
  const { products } = useWorkspaceData();
  const lastUpdate = products.reduce((latest, p) => (p.lastUpdated > latest ? p.lastUpdated : latest), '');

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-page">
      <div className="mx-auto flex w-full max-w-[1280px] items-center gap-3 px-4 py-3 sm:px-6 lg:px-10">
        <button type="button" onClick={onMenu} aria-label="Abrir menú" className={buttonClass('icon', 'lg:hidden')}>
          <Menu size={20} />
        </button>
        <WorkspaceSwitcher />
        {lastUpdate && (
          <p className="ml-auto hidden text-xs text-muted md:block">
            Costo promedio ponderado · actualizado {isToday(lastUpdate) ? 'hoy' : `el ${formatDay(lastUpdate)}`}
          </p>
        )}
      </div>
    </header>
  );
}
