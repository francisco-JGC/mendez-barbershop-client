import {
  Armchair,
  Building2,
  LayoutDashboard,
  Package,
  Receipt,
  Scissors,
  Settings,
  ShoppingCart,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Role } from '@/types/auth';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

// The admin panel shared by admins (multi-branch, via header switcher) and
// supervisors (single-branch, pinned). Supervisors don't see the "Sucursales"
// entry because they can't manage branches — that's admin-only.
const branchPanelNav: NavItem[] = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Nueva venta', path: '/admin/sales', icon: ShoppingCart },
  { label: 'Registro de ventas', path: '/admin/sales-record', icon: Receipt },
  { label: 'Servicios', path: '/admin/services', icon: Scissors },
  { label: 'Productos', path: '/admin/products', icon: Package },
  { label: 'Sillas', path: '/admin/stations', icon: Armchair },
  { label: 'Usuarios', path: '/admin/users', icon: Users },
  { label: 'Configuración', path: '/admin/settings', icon: Settings },
];

export const navItemsByRole: Record<Role, NavItem[]> = {
  [Role.ADMIN]: [
    ...branchPanelNav,
    { label: 'Sucursales', path: '/admin/branches', icon: Building2 },
  ],
  [Role.SUPERVISOR]: branchPanelNav,
  [Role.BARBER]: [
    { label: 'Mi día', path: '/barber', icon: LayoutDashboard },
  ],
  // Sellers use the Flutter POS app, not this web client — no nav items here.
  [Role.SELLER]: [],
};

export const roleLabels: Record<Role, string> = {
  [Role.ADMIN]: 'Administrador',
  [Role.SUPERVISOR]: 'Supervisor',
  [Role.BARBER]: 'Barbero',
  [Role.SELLER]: 'Vendedor',
};
