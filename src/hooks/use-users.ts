import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '@/lib/users-api';

export function useUsers(enabled = true) {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    enabled,
  });
}
