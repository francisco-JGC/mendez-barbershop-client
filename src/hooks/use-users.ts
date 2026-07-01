import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createUser,
  fetchUsers,
  resetUserPassword,
  setUserActive,
  updateUser,
} from '@/lib/users-api';
import type { CreateUserInput, UpdateUserInput } from '@/types/user';

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

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) =>
      updateUser(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
}

export function useResetUserPassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      resetUserPassword(id, password),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
}
