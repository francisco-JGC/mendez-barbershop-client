import { Role } from '@/types/auth';

export function roleHomePath(role: Role): string {
  if (role === Role.BARBER) return '/barber';
  // Every admin lands on the same panel and picks the branch to operate on
  // from the header switcher (Escenario A).
  return '/admin';
}
