export type UserRole = 'admin' | 'chef' | 'manager';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: string;
}

// Cada hotel tiene restaurante y bar; cada área compra, guarda stock y costea por separado.
export type Area = 'restaurant' | 'bar';

export interface Hotel {
  id: string;
  name: string;
}

export type UnitType = 'kg' | 'l' | 'unit' | 'g' | 'ml';

export interface Ingredient {
  id: string;
  hotelId: string;
  area: Area;
  name: string;
  unitType: UnitType;
  costPerUnit: number; // costo promedio ponderado de las compras
  currentStock: number;
  minStock: number;
  lastUpdated: string;
}

// compra y ajuste pueden subir el stock; consumo y merma lo bajan.
export type MovementType = 'purchase' | 'consumption' | 'waste' | 'adjustment';

export interface StockMovement {
  id: string;
  ingredientId: string;
  type: MovementType;
  quantity: number; // con signo: positivo entra, negativo sale
  unitCost: number; // costo unitario al momento del movimiento
  stockAfter: number;
  date: string; // ISO
  note?: string;
  userName: string;
}

export interface DishIngredient {
  ingredientId: string;
  quantityNeeded: number;
}

export interface Dish {
  id: string;
  hotelId: string;
  area: Area;
  name: string;
  sellingPrice: number;
  ingredients: DishIngredient[];
  description?: string;
}

export interface CostAnalysis {
  dishId: string;
  dishName: string;
  totalCost: number;
  sellingPrice: number;
  margin: number;
  marginPercentage: number;
}

export const ROLE_MENU_MAP: Record<UserRole, MenuItem[]> = {
  admin: [
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
    { id: 'costeo', label: 'Costeo', href: '/costeo', icon: 'DollarSign' },
    { id: 'eventos', label: 'Eventos', href: '/eventos', icon: 'Calendar' },
    { id: 'reservas', label: 'Reservas', href: '/reservas', icon: 'BookOpen' },
    { id: 'pagos', label: 'Pagos', href: '/pagos', icon: 'CreditCard' },
    { id: 'platos', label: 'Platos', href: '/platos', icon: 'UtensilsCrossed' },
    { id: 'inventario', label: 'Inventario', href: '/inventario', icon: 'Package' },
    { id: 'usuarios', label: 'Usuarios', href: '/usuarios', icon: 'Users' },
    { id: 'reportes', label: 'Reportes', href: '/reportes', icon: 'BarChart3' },
    { id: 'configuracion', label: 'Configuración', href: '/configuracion', icon: 'Settings' },
  ],
  chef: [
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
    { id: 'platos', label: 'Platos', href: '/platos', icon: 'UtensilsCrossed' },
    { id: 'inventario', label: 'Inventario', href: '/inventario', icon: 'Package' },
    { id: 'eventos', label: 'Eventos', href: '/eventos', icon: 'Calendar' },
  ],
  manager: [
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
    { id: 'costeo', label: 'Costeo', href: '/costeo', icon: 'DollarSign' },
    { id: 'eventos', label: 'Eventos', href: '/eventos', icon: 'Calendar' },
    { id: 'reservas', label: 'Reservas', href: '/reservas', icon: 'BookOpen' },
    { id: 'pagos', label: 'Pagos', href: '/pagos', icon: 'CreditCard' },
    { id: 'platos', label: 'Platos', href: '/platos', icon: 'UtensilsCrossed' },
    { id: 'reportes', label: 'Reportes', href: '/reportes', icon: 'BarChart3' },
  ],
};
