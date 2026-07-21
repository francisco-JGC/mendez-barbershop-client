import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createBranch,
  createBranchSupervisor,
  fetchBranch,
  fetchBranchSupervisors,
  fetchBranches,
  resetBranchSupervisorPassword,
  setBranchActive,
  setBranchSupervisorActive,
  updateBranch,
  updateBranchSupervisor,
} from '@/lib/branches-api';
import type {
  CreateBranchSupervisorInput,
  CreateBranchInput,
} from '@/types/branch';
import type { UpdateUserInput } from '@/types/user';

const BRANCHES_KEY = ['branches'];
const branchKey = (id: string) => ['branches', id];
const branchSupervisorsKey = (id: string) => ['branches', id, 'supervisors'];

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

export function useCreateBranchSupervisor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      branchId,
      input,
    }: {
      branchId: string;
      input: CreateBranchSupervisorInput;
    }) => createBranchSupervisor(branchId, input),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: branchSupervisorsKey(variables.branchId),
      });
    },
  });
}

export function useBranchSupervisors(branchId: string | undefined) {
  return useQuery({
    queryKey: branchId
      ? branchSupervisorsKey(branchId)
      : ['branch-supervisors', 'noop'],
    queryFn: () => fetchBranchSupervisors(branchId!),
    enabled: !!branchId,
  });
}

export function useUpdateBranchSupervisor(branchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      input,
    }: {
      userId: string;
      input: UpdateUserInput;
    }) => updateBranchSupervisor(branchId, userId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: branchSupervisorsKey(branchId),
      });
    },
  });
}

export function useSetBranchSupervisorActive(branchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      isActive,
    }: {
      userId: string;
      isActive: boolean;
    }) => setBranchSupervisorActive(branchId, userId, isActive),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: branchSupervisorsKey(branchId),
      });
    },
  });
}

export function useResetBranchSupervisorPassword(branchId: string) {
  return useMutation({
    mutationFn: ({
      userId,
      password,
    }: {
      userId: string;
      password: string;
    }) => resetBranchSupervisorPassword(branchId, userId, password),
  });
}
