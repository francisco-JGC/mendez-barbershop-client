import { Role } from '@/types/auth';

export function roleHomePath(role: Role): string {
  if (role === Role.ADMIN) return '/admin';
  if (role === Role.BARBER) return '/barber';
  return '/super-admin/branches';
}
