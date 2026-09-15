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

  const roleColors = {
    admin: { bg: 'from-orange-500 to-red-600', text: 'text-orange-600' },
    chef: 'from-amber-500 to-orange-600',
    manager: 'from-emerald-500 to-teal-600',
  };

  const getRoleColor = () => {
    const colors: Record<string, { bg: string; text: string }> = {
      admin: { bg: 'from-orange-500 to-red-600', text: 'text-orange-600' },
      chef: { bg: 'from-amber-500 to-orange-600', text: 'text-amber-600' },
      manager: { bg: 'from-emerald-500 to-teal-600', text: 'text-emerald-600' },
    };
    return colors[user.role] || { bg: 'from-blue-500 to-cyan-600', text: 'text-blue-600' };
  };

  const roleColor = getRoleColor();

  return (
    <aside
      className={`${
        isOpen ? 'w-72' : 'w-24'
      } bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white transition-all duration-300 ease-in-out fixed h-screen left-0 top-0 overflow-y-auto border-r border-slate-800/50 shadow-2xl`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-slate-800/50">
          <div className="flex items-center justify-between">
            {isOpen && (
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${roleColor.bg} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                  🍽️
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
                    Restaurant
                  </h1>
                  <p className="text-xs text-slate-400">Management</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors duration-200 text-slate-400 hover:text-white"
            >
              <Icons.ChevronLeft size={20} className={`transition-transform ${!isOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-8 space-y-1">
          {isOpen && <p className="text-xs font-semibold text-slate-500 px-4 mb-4 uppercase tracking-wider">Menú Principal</p>}
          {menuItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`group relative flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? `bg-gradient-to-r ${roleColor.bg} text-white shadow-lg shadow-orange-500/20`
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
                title={isOpen ? '' : item.label}
              >
                {/* Background glow effect for active items */}
                {isActive && (
                  <div className={`absolute inset-0 rounded-xl blur-md opacity-20 -z-10 bg-gradient-to-r ${roleColor.bg}`} />
                )}

                <span className={`text-2xl flex-shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {getIcon(item.icon) ? getIcon(item.icon) : '•'}
                </span>

                {isOpen && (
                  <>
                    <span className="text-sm font-semibold">{item.label}</span>
                    {isActive && <div className="ml-auto w-2 h-2 bg-white rounded-full" />}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer - User Info */}
        <div className={`p-4 border-t border-slate-800/50 bg-slate-900/50 backdrop-blur-sm ${!isOpen && 'flex flex-col items-center'}`}>
          <div className={`flex items-center gap-3 mb-4 ${isOpen ? 'flex-row' : 'flex-col'}`}>
            <div className={`w-12 h-12 bg-gradient-to-br ${roleColor.bg} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg text-white font-bold text-lg`}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            {isOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className={`text-xs font-medium ${roleColor.text} capitalize`}>{user.role}</p>
              </div>
            )}
          </div>

          <button
            onClick={() => useAuthStore.setState({ user: null, isAuthenticated: false })}
            className={`w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 bg-slate-800/50 hover:bg-red-500/10 text-slate-300 hover:text-red-400 border border-slate-700/50 hover:border-red-500/50 flex items-center justify-center gap-2 ${!isOpen && 'p-2'}`}
          >
            <Icons.LogOut size={16} />
            {isOpen && 'Cerrar sesión'}
          </button>
        </div>
      </div>
    </aside>
  );
}
