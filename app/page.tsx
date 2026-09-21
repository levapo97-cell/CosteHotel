'use client';

import { useRouter } from 'next/navigation';
import { ChefHat, ChevronRight, Info } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types';
import { InfoNote } from '@/components/ui/Form';

const DEMO_USERS = [
  { id: '1', name: 'Carlos Admin', email: 'admin@restaurant.com', role: 'admin' as UserRole },
  { id: '2', name: 'Juan Chef', email: 'chef@restaurant.com', role: 'chef' as UserRole },
  { id: '3', name: 'María Manager', email: 'manager@restaurant.com', role: 'manager' as UserRole },
];

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: 'Acceso total al sistema',
  chef: 'Recetas e inventario',
  manager: 'Costeo y operaciones',
};

export default function Home() {
  const setUser = useAuthStore((state) => state.setUser);
  const router = useRouter();

  const handleLogin = (user: (typeof DEMO_USERS)[number]) => {
    setUser(user);
    router.push('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-card bg-accent text-on-accent">
            <ChefHat size={28} />
          </div>
          <p className="text-[11px] font-semibold tracking-[0.14em] text-gold uppercase">Hotel &amp; Bar</p>
          <h1 className="mt-1 font-display text-page-title font-semibold text-ink">Appitit</h1>
          <p className="mt-2 text-muted">Elige un usuario para entrar</p>
        </div>

        <ul className="mb-6 space-y-3">
          {DEMO_USERS.map((user) => (
            <li key={user.role}>
              <button
                type="button"
                onClick={() => handleLogin(user)}
                className="group flex w-full items-center gap-4 rounded-card border border-line bg-page p-4 text-left shadow-card transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-control bg-gold font-semibold text-on-accent">
                  {user.name.charAt(0)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-ink">{user.name}</span>
                  <span className="block truncate text-[13px] text-muted">{user.email}</span>
                  <span className="mt-0.5 block text-xs text-muted">{ROLE_DESCRIPTIONS[user.role]}</span>
                </span>
                <ChevronRight size={18} className="shrink-0 text-muted transition-colors group-hover:text-accent-text" />
              </button>
            </li>
          ))}
        </ul>

        <InfoNote icon={<Info size={16} />}>
          <strong className="font-semibold">Modo demostración:</strong> cada rol ve distintas secciones. Los datos viven en
          memoria y se reinician al recargar la página.
        </InfoNote>
      </div>
    </div>
  );
}
