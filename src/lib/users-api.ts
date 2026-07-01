import { api } from '@/lib/api';
import type { CreateUserInput, UserSummary } from '@/types/user';

export async function fetchUsers(): Promise<UserSummary[]> {
  const { data } = await api.get<UserSummary[]>('/users');
  return data;
}

export async function createUser(input: CreateUserInput): Promise<UserSummary> {
  const { data } = await api.post<UserSummary>('/users', input);
  return data;
}

export async function setUserActive(
  id: string,
  isActive: boolean,
): Promise<UserSummary> {
  const { data } = await api.patch<UserSummary>(`/users/${id}/active`, {
    isActive,
  });
  return data;
}
