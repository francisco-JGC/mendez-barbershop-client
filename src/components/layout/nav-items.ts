import {
  Armchair,
  Building2,
  LayoutDashboard,
  Package,
  Receipt,
  Scissors,
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

export const navItemsByRole: Record<Role, NavItem[]> = {
  [Role.ADMIN]: [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Nueva venta', path: '/admin/sales', icon: ShoppingCart },
    { label: 'Registro de ventas', path: '/admin/sales-record', icon: Receipt },
    { label: 'Servicios', path: '/admin/services', icon: Scissors },
    { label: 'Productos', path: '/admin/products', icon: Package },
    { label: 'Sillas', path: '/admin/stations', icon: Armchair },
    { label: 'Usuarios', path: '/admin/users', icon: Users },
  ],
  [Role.BARBER]: [
    { label: 'Mi día', path: '/barber', icon: LayoutDashboard },
  ],
  [Role.SUPER_ADMIN]: [
    { label: 'Sucursales', path: '/super-admin/branches', icon: Building2 },
  ],
};

export const roleLabels: Record<Role, string> = {
  [Role.ADMIN]: 'Administrador',
  [Role.BARBER]: 'Barbero',
  [Role.SUPER_ADMIN]: 'Super admin',
};
