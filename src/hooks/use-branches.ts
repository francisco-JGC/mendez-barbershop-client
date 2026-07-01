import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createBranch,
  createBranchAdmin,
  fetchBranches,
  setBranchActive,
} from '@/lib/branches-api';
import type {
  CreateBranchAdminInput,
  CreateBranchInput,
} from '@/types/branch';

const BRANCHES_KEY = ['branches'];

export function useBranches() {
  return useQuery({
    queryKey: BRANCHES_KEY,
    queryFn: fetchBranches,
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

export function useSetBranchActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      setBranchActive(id, isActive),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: BRANCHES_KEY });
    },
  });
}

export function useCreateBranchAdmin() {
  return useMutation({
    mutationFn: ({
      branchId,
      input,
    }: {
      branchId: string;
      input: CreateBranchAdminInput;
    }) => createBranchAdmin(branchId, input),
  });
}
