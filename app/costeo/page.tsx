'use client';

import { MainLayout } from '@/components/Layout/MainLayout';
import { PageHeader } from '@/components/Layout/PageHeader';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IngredientsTab } from '@/components/Costeo/IngredientsTab';
import { DishesTab } from '@/components/Costeo/DishesTab';
import { ReportsTab } from '@/components/Costeo/ReportsTab';

type TabType = 'ingredients' | 'dishes' | 'reports';

export default function CosteoPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('ingredients');

  useEffect(() => {
    if (!user) router.push('/');
  }, [user, router]);

  if (!user) return null;

  const tabs = [
    { id: 'ingredients', label: 'Ingredientes', icon: '🥘' },
    { id: 'dishes', label: 'Platos', icon: '🍽️' },
    { id: 'reports', label: 'Reportes', icon: '📊' },
  ] as const;

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Costeo"
          description="Gestiona costos de ingredientes, calcula márgenes y analiza rentabilidad"
        />

        <div className="bg-white rounded-lg shadow">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 text-center font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'ingredients' && <IngredientsTab />}
            {activeTab === 'dishes' && <DishesTab />}
            {activeTab === 'reports' && <ReportsTab />}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
