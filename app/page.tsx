'use client';

import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const DEMO_USERS = [
  { id: '1', name: 'Carlos Admin', email: 'admin@restaurant.com', role: 'admin' as UserRole },
  { id: '2', name: 'Juan Chef', email: 'chef@restaurant.com', role: 'chef' as UserRole },
  { id: '3', name: 'María Manager', email: 'manager@restaurant.com', role: 'manager' as UserRole },
];

export default function Home() {
  const setUser = useAuthStore((state) => state.setUser);
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleLogin = (role: UserRole) => {
    const user = DEMO_USERS.find((u) => u.role === role);
    if (user) {
      setSelectedRole(role);
      setUser(user);
      router.push('/dashboard');
    }
  };

  const getRoleGradient = (role: UserRole) => {
    const gradients = {
      admin: 'from-orange-500 to-red-600',
      chef: 'from-amber-500 to-orange-600',
      manager: 'from-emerald-500 to-teal-600',
    };
    return gradients[role];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Logo & Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 shadow-2xl mb-6">
            <span className="text-4xl">🍽️</span>
          </div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-300 mb-2">
            RestaurantApp
          </h1>
          <p className="text-slate-400 text-lg">Sistema de Gestión para Restaurantes</p>
        </div>

        {/* Login Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {DEMO_USERS.map((user) => (
            <button
              key={user.role}
              onClick={() => handleLogin(user.role)}
              className={`group relative p-6 rounded-2xl transition-all duration-300 overflow-hidden
                ${
                  selectedRole === user.role
                    ? `bg-gradient-to-br ${getRoleGradient(user.role)} shadow-2xl transform scale-105`
                    : 'bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/50 hover:border-slate-600'
                }`}
            >
              {/* Gradient overlay on hover */}
              {selectedRole !== user.role && (
                <div className={`absolute inset-0 bg-gradient-to-br ${getRoleGradient(user.role)} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              )}

              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg mb-4 ${
                  selectedRole === user.role
                    ? 'bg-white/20 text-white'
                    : `bg-gradient-to-br ${getRoleGradient(user.role)} text-white`
                }`}>
                  {user.name.charAt(0)}
                </div>
                <p className={`font-bold text-lg mb-1 ${selectedRole === user.role ? 'text-white' : 'text-slate-100'}`}>
                  {user.name}
                </p>
                <p className={`text-sm mb-4 ${selectedRole === user.role ? 'text-white/80' : 'text-slate-400'}`}>
                  {user.role === 'admin' && 'Acceso Total'}
                  {user.role === 'chef' && 'Gestión de Platos'}
                  {user.role === 'manager' && 'Operaciones'}
                </p>
                <p className={`text-xs ${selectedRole === user.role ? 'text-white/60' : 'text-slate-500'}`}>
                  {user.email}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Info Box */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 backdrop-blur-sm">
          <p className="text-sm text-slate-300">
            <span className="font-semibold text-slate-100">💡 Demo:</span> Selecciona tu rol para acceder al sistema. Cada rol tiene acceso a diferentes módulos y funcionalidades.
          </p>
        </div>
      </div>
    </div>
  );
}
