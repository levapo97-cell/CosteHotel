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

export interface Ingredient {
  id: string;
  name: string;
  unitType: 'kg' | 'l' | 'unit' | 'g' | 'ml';
  costPerUnit: number;
  currentStock: number;
  lastUpdated: string;
}

export interface DishIngredient {
  ingredientId: string;
  quantityNeeded: number;
}

export interface Dish {
  id: string;
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
