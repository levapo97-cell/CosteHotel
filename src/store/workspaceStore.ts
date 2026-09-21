import { create } from 'zustand';
import { Area, Hotel } from '@/types';

export const HOTELS: Hotel[] = [
  { id: 'h1', name: 'Hotel Central' },
  { id: 'h2', name: 'Hotel Playa' },
];

interface WorkspaceState {
  hotelId: string;
  area: Area;
  setHotel: (hotelId: string) => void;
  setArea: (area: Area) => void;
}

// Hotel y área con los que se está trabajando en Inventario, Platos y Costeo.
export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  hotelId: HOTELS[0].id,
  area: 'restaurant',
  setHotel: (hotelId) => set({ hotelId }),
  setArea: (area) => set({ area }),
}));
