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
        isOpen ? 'w-72' : 'w-24'
      } bg-white transition-all duration-300 ease-in-out fixed h-screen left-0 top-0 overflow-y-auto border-r border-gray-200 shadow-sm`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            {isOpen && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                  🍽️
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Restaurant</h1>
                  <p className="text-xs text-gray-500">Management</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-gray-600 hover:text-gray-900"
            >
              <Icons.ChevronLeft size={20} className={`transition-transform ${!isOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {isOpen && <p className="text-xs font-semibold text-gray-500 px-4 mb-4 uppercase tracking-wider">Navegación</p>}
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                title={isOpen ? '' : item.label}
              >
                <span className={`flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                  {getIcon(item.icon)}
                </span>

                {isOpen && (
                  <>
                    <span className="text-sm">{item.label}</span>
                    {isActive && <div className="ml-auto w-1.5 h-1.5 bg-blue-600 rounded-full" />}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer - User Info */}
        <div className={`p-4 border-t border-gray-100 bg-gray-50 ${!isOpen && 'flex flex-col items-center'}`}>
          <div className={`flex items-center gap-3 mb-4 ${isOpen ? 'flex-row' : 'flex-col'}`}>
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            {isOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            )}
          </div>

          <button
            onClick={() => useAuthStore.setState({ user: null, isAuthenticated: false })}
            className={`w-full px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 hover:border-gray-300 flex items-center justify-center gap-2 ${!isOpen && 'p-2'}`}
          >
            <Icons.LogOut size={16} />
            {isOpen && 'Cerrar sesión'}
          </button>
        </div>
      </div>
    </aside>
  );
}
