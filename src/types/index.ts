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

export const ROLE_MENU_MAP: Record<UserRole, MenuItem[]> = {
  admin: [
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
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
    { id: 'eventos', label: 'Eventos', href: '/eventos', icon: 'Calendar' },
    { id: 'reservas', label: 'Reservas', href: '/reservas', icon: 'BookOpen' },
    { id: 'pagos', label: 'Pagos', href: '/pagos', icon: 'CreditCard' },
    { id: 'platos', label: 'Platos', href: '/platos', icon: 'UtensilsCrossed' },
    { id: 'reportes', label: 'Reportes', href: '/reportes', icon: 'BarChart3' },
  ],
};
