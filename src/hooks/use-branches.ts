import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createBranch,
  createBranchAdmin,
  fetchBranch,
  fetchBranchAdmins,
  fetchBranches,
  resetBranchAdminPassword,
  setBranchActive,
  setBranchAdminActive,
  updateBranch,
  updateBranchAdmin,
} from '@/lib/branches-api';
import type {
  CreateBranchAdminInput,
  CreateBranchInput,
} from '@/types/branch';
import type { UpdateUserInput } from '@/types/user';

const BRANCHES_KEY = ['branches'];
const branchKey = (id: string) => ['branches', id];
const branchAdminsKey = (id: string) => ['branches', id, 'admins'];

export function useBranches() {
  return useQuery({
    queryKey: BRANCHES_KEY,
    queryFn: fetchBranches,
  });
}

export function useBranch(id: string | undefined) {
  return useQuery({
    queryKey: id ? branchKey(id) : ['branches', 'noop'],
    queryFn: () => fetchBranch(id!),
    enabled: !!id,
  });
}

export function useCreateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBranchInput) => createBranch(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: BRANCHES_KEY });
    },
  });
}

export function useUpdateBranch(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name?: string }) => updateBranch(id, input),
    onSuccess: (data) => {
      queryClient.setQueryData(branchKey(id), data);
      void queryClient.invalidateQueries({ queryKey: BRANCHES_KEY });
    },
  });
}

export function useSetBranchActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      setBranchActive(id, isActive),
    onSuccess: (data) => {
      queryClient.setQueryData(branchKey(data.id), data);
      void queryClient.invalidateQueries({ queryKey: BRANCHES_KEY });
    },
  });
}

export function useCreateBranchAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      branchId,
      input,
    }: {
      branchId: string;
      input: CreateBranchAdminInput;
    }) => createBranchAdmin(branchId, input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: branchAdminsKey(variables.branchId),
      });
    },
  });
}

export function useBranchAdmins(branchId: string | undefined) {
  return useQuery({
    queryKey: branchId ? branchAdminsKey(branchId) : ['branch-admins', 'noop'],
    queryFn: () => fetchBranchAdmins(branchId!),
    enabled: !!branchId,
  });
}

export function useUpdateBranchAdmin(branchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, input }: { userId: string; input: UpdateUserInput }) =>
      updateBranchAdmin(branchId, userId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: branchAdminsKey(branchId) });
    },
  });
}

export function useSetBranchAdminActive(branchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      setBranchAdminActive(branchId, userId, isActive),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: branchAdminsKey(branchId) });
    },
  });
}

export function useResetBranchAdminPassword(branchId: string) {
  return useMutation({
    mutationFn: ({ userId, password }: { userId: string; password: string }) =>
      resetBranchAdminPassword(branchId, userId, password),
  });
}
