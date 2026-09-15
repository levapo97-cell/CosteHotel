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
      setUser(user);
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">RestaurantApp</h1>
          <p className="text-slate-600">Selecciona tu rol para continuar</p>
        </div>

        <div className="space-y-4">
          {DEMO_USERS.map((user) => (
            <button
              key={user.role}
              onClick={() => handleLogin(user.role)}
              className={`w-full p-4 rounded-lg border-2 transition-all duration-300 text-left
                ${
                  selectedRole === user.role
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 hover:border-blue-400 bg-white'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white
                  ${user.role === 'admin' ? 'bg-red-500' : user.role === 'chef' ? 'bg-orange-500' : 'bg-green-500'}`}>
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{user.name}</p>
                  <p className="text-sm text-slate-500 capitalize">{user.role}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-xs text-slate-600">
            <strong>Demostración:</strong> Selecciona cualquier rol para ver el menú correspondiente. Cada rol tiene acceso a diferentes módulos.
          </p>
        </div>
      </div>
    </div>
  );
}
