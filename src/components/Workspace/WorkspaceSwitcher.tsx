'use client';

import { Building2, ChevronDown, UtensilsCrossed, Wine } from 'lucide-react';
import { Area } from '@/types';
import { HOTELS, useWorkspaceStore } from '@/store/workspaceStore';
import { AREA_COPY } from '@/lib/inventory';
import { Segmented } from '@/components/ui/Form';

export function WorkspaceSwitcher() {
  const { hotelId, area, setHotel, setArea } = useWorkspaceStore();

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <div className="relative flex min-w-0 items-center rounded-control border border-line bg-surface pl-3">
        <Building2 size={16} className="shrink-0 text-muted" />
        <select
          value={hotelId}
          onChange={(e) => setHotel(e.target.value)}
          aria-label="Hotel"
          className="min-w-0 cursor-pointer appearance-none bg-transparent py-2 pr-9 pl-2 text-sm font-medium text-ink outline-none focus-visible:underline"
        >
          {HOTELS.map((hotel) => (
            <option key={hotel.id} value={hotel.id}>
              {hotel.name}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute right-3 text-muted" />
      </div>

      <Segmented<Area>
        label="Área"
        value={area}
        onChange={setArea}
        options={[
          { value: 'restaurant', label: AREA_COPY.restaurant.label, icon: <UtensilsCrossed size={15} /> },
          { value: 'bar', label: AREA_COPY.bar.label, icon: <Wine size={15} /> },
        ]}
      />
    </div>
  );
}
