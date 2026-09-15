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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-blue-600 mb-4">
            <span className="text-3xl">🍽️</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">RestaurantApp</h1>
          <p className="text-gray-600">Selecciona tu rol para acceder</p>
        </div>

        {/* Login Cards */}
        <div className="space-y-3 mb-6">
          {DEMO_USERS.map((user) => (
            <button
              key={user.role}
              onClick={() => handleLogin(user.role)}
              className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                selectedRole === user.role
                  ? 'bg-blue-50 border-blue-600 shadow-md'
                  : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-xs text-gray-500 capitalize mt-1">
                    {user.role === 'admin' && 'Acceso total al sistema'}
                    {user.role === 'chef' && 'Gestión de platos e inventario'}
                    {user.role === 'manager' && 'Gestión de operaciones'}
                  </p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  selectedRole === user.role
                    ? 'border-blue-600 bg-blue-600'
                    : 'border-gray-300'
                }`}>
                  {selectedRole === user.role && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-blue-900">💡 Modo demostración:</span> Elige un rol para ver el sistema. Cada rol accede a diferentes funciones.
          </p>
        </div>
      </div>
    </div>
  );
}
