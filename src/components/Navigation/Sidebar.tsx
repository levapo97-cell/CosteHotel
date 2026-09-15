'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ROLE_MENU_MAP } from '@/types';
import * as Icons from 'lucide-react';
import { useState } from 'react';

export function Sidebar() {
  const user = useAuthStore((state) => state.user);
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  if (!user) return null;

  const menuItems = ROLE_MENU_MAP[user.role];

  const getIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as React.ComponentType<{ size: number; className?: string }>;
    if (!IconComponent) return null;
    return <IconComponent size={20} />;
  };

  return (
    <aside
      className={`${
        isOpen ? 'w-64' : 'w-20'
      } bg-slate-900 text-white transition-all duration-300 ease-in-out fixed h-screen left-0 top-0 overflow-y-auto`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          {isOpen && <h1 className="text-xl font-bold">RestaurantApp</h1>}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-slate-800 rounded-lg transition"
          >
            <Icons.Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
                title={isOpen ? '' : item.label}
              >
                {getIcon(item.icon)}
                {isOpen && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className={`flex items-center gap-3 ${isOpen ? 'flex-row' : 'flex-col'}`}>
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold">{user.name.charAt(0).toUpperCase()}</span>
            </div>
            {isOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-slate-400 capitalize">{user.role}</p>
              </div>
            )}
          </div>
          <button className="w-full mt-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg transition">
            {isOpen ? 'Cerrar sesión' : '⎋'}
          </button>
        </div>
      </div>
    </aside>
  );
}
