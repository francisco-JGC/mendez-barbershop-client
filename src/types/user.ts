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

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: Role;
}
