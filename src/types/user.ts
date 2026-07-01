import type { Role } from '@/types/auth';

export interface UserSummary {
  id: string;
  barbershopId: string | null;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
