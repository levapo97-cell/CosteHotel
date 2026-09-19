'use client';

import { UtensilsCrossed, Wine } from 'lucide-react';
import { Area } from '@/types';
import { HOTELS, useWorkspaceStore } from '@/store/workspaceStore';
import { AREA_COPY } from '@/lib/inventory';
import { Select } from '@/components/ui/Form';

const AREA_ICONS: Record<Area, typeof Wine> = { restaurant: UtensilsCrossed, bar: Wine };

export function WorkspaceSwitcher() {
  const { hotelId, area, setHotel, setArea } = useWorkspaceStore();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={hotelId}
        onChange={(e) => setHotel(e.target.value)}
        aria-label="Hotel"
        className="w-48"
      >
        {HOTELS.map((hotel) => (
          <option key={hotel.id} value={hotel.id}>
            {hotel.name}
          </option>
        ))}
      </Select>

      <div role="radiogroup" aria-label="Área" className="flex rounded-lg border border-gray-300 bg-gray-50 p-0.5">
        {(Object.keys(AREA_COPY) as Area[]).map((value) => {
          const Icon = AREA_ICONS[value];
          const active = value === area;
          return (
            <button
              key={value}
              role="radio"
              aria-checked={active}
              onClick={() => setArea(value)}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                active ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon size={16} />
              {AREA_COPY[value].label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
