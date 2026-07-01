import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createUser, fetchUsers, setUserActive } from '@/lib/users-api';
import type { CreateUserInput } from '@/types/user';

const USERS_KEY = ['users'];

export function useUsers(enabled = true) {
  return useQuery({
    queryKey: USERS_KEY,
    queryFn: fetchUsers,
    enabled,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateUserInput) => createUser(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
}

export function useSetUserActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      setUserActive(id, isActive),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
}
