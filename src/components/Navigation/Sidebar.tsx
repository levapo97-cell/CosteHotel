'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChefHat, DollarSign, LogOut, LucideIcon, Package, UtensilsCrossed } from 'lucide-react';
import { MENU } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { isLowStock } from '@/lib/inventory';
import { useWorkspaceData } from '@/components/Workspace/useWorkspaceData';
import { buttonClass } from '@/components/ui/Button';

// Mapa explícito en vez de `import * as Icons`, que metía todos los iconos de lucide al bundle.
const ICONS: Record<string, LucideIcon> = {
  Package,
  UtensilsCrossed,
  DollarSign,
};

interface SidebarProps {
  open: boolean;
  onNavigate: () => void;
}

export function Sidebar({ open, onNavigate }: SidebarProps) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const pathname = usePathname();
  const { products } = useWorkspaceData();

  if (!user) return null;

  const lowStockCount = products.filter(isLowStock).length;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-[250px] flex-col border-r border-line bg-surface transition-[translate,visibility] duration-200 lg:visible lg:translate-x-0 ${
        open ? 'visible translate-x-0' : 'invisible -translate-x-full'
      }`}
    >
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex size-[38px] shrink-0 items-center justify-center rounded-control bg-accent text-on-accent">
          <ChefHat size={20} />
        </div>
        <div className="min-w-0">
          <p className="font-display text-lg leading-tight font-semibold text-ink">Appitit</p>
          <p className="text-[11px] font-medium tracking-[0.12em] text-muted uppercase">Hotel &amp; Bar</p>
        </div>
      </div>

      <nav aria-label="Principal" className="flex-1 overflow-y-auto px-3 pb-4">
        <p className="px-3 pb-2 text-[10px] font-semibold tracking-[0.14em] text-muted uppercase">Operación</p>
        <ul className="space-y-0.5">
          {MENU.map((item) => {
            const Icon = ICONS[item.icon] ?? Package;
            const active = pathname === item.href;
            const badge = item.id === 'inventario' && lowStockCount > 0 ? lowStockCount : null;
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? 'page' : undefined}
                  className={`relative flex items-center gap-3 rounded-control px-3 py-2.5 text-sm transition-colors ${
                    active ? 'bg-accent/10 font-semibold text-accent-text' : 'text-muted hover:bg-ink/[0.04] hover:text-ink'
                  }`}
                >
                  {active && <span aria-hidden className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-accent" />}
                  <Icon size={18} className="shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {badge && (
                    <span
                      className="rounded-chip bg-bad px-1.5 py-0.5 text-[11px] leading-none font-semibold text-on-accent"
                      aria-label={`${badge} productos bajo mínimo`}
                    >
                      {badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-line p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-control bg-gold font-semibold text-on-accent">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
            <p className="text-xs text-muted">Sesión activa</p>
          </div>
        </div>
        <button type="button" onClick={logout} className={buttonClass('neutral', 'w-full')}>
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
