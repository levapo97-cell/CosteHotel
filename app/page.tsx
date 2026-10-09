'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChefHat } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Field, inputClass } from '@/components/ui/Form';
import { buttonClass } from '@/components/ui/Button';

// Login simple: un solo acceso. La sesión vive en memoria (se detallará el backend en la Fase 2).
export default function Home() {
  const setUser = useAuthStore((state) => state.setUser);
  const router = useRouter();
  const [name, setName] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const displayName = name.trim() || 'Equipo';
    setUser({ id: '1', name: displayName, email: 'equipo@appitit.app', role: 'admin' });
    router.push('/inventario');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-card bg-accent text-on-accent">
            <ChefHat size={28} />
          </div>
          <p className="text-[11px] font-semibold tracking-[0.14em] text-gold uppercase">Inventario &amp; Costeo</p>
          <h1 className="mt-1 font-display text-page-title font-semibold text-ink">Appitit</h1>
          <p className="mt-2 text-muted">Entra para gestionar tu inventario</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-card border border-line bg-page p-6 shadow-card">
          <Field label="Tu nombre" htmlFor="login-name" hint="Se usa para firmar los movimientos del inventario.">
            <input
              id="login-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: María"
              autoFocus
              className={inputClass()}
            />
          </Field>
          <button type="submit" className={buttonClass('primary', 'w-full')}>
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
