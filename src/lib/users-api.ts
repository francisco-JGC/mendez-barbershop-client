import { api } from '@/lib/api';
import type { UserSummary } from '@/types/user';

export async function fetchUsers(): Promise<UserSummary[]> {
  const { data } = await api.get<UserSummary[]>('/users');
  return data;
}
