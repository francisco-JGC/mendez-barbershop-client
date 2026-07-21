import { api } from '@/lib/api';
import type {
  Branch,
  CreateBranchInput,
  CreateBranchSupervisorInput,
} from '@/types/branch';
import type { UpdateUserInput, UserSummary } from '@/types/user';

export async function fetchBranches(): Promise<Branch[]> {
  const { data } = await api.get<Branch[]>('/tenants');
  return data;
}

export async function fetchBranch(id: string): Promise<Branch> {
  const { data } = await api.get<Branch>(`/tenants/${id}`);
  return data;
}

export async function createBranch(input: CreateBranchInput): Promise<Branch> {
  const { data } = await api.post<Branch>('/tenants', input);
  return data;
}

export async function updateBranch(
  id: string,
  input: { name?: string },
): Promise<Branch> {
  const { data } = await api.patch<Branch>(`/tenants/${id}`, input);
  return data;
}

export async function setBranchActive(
  id: string,
  isActive: boolean,
): Promise<Branch> {
  const { data } = await api.patch<Branch>(`/tenants/${id}/active`, {
    isActive,
  });
  return data;
}

export async function createBranchSupervisor(
  branchId: string,
  input: CreateBranchSupervisorInput,
): Promise<UserSummary> {
  const { data } = await api.post<UserSummary>(
    `/tenants/${branchId}/supervisors`,
    input,
  );
  return data;
}

export async function fetchBranchSupervisors(
  branchId: string,
): Promise<UserSummary[]> {
  const { data } = await api.get<UserSummary[]>(
    `/tenants/${branchId}/supervisors`,
  );
  return data;
}

export async function updateBranchSupervisor(
  branchId: string,
  userId: string,
  input: UpdateUserInput,
): Promise<UserSummary> {
  const { data } = await api.patch<UserSummary>(
    `/tenants/${branchId}/supervisors/${userId}`,
    input,
  );
  return data;
}

export async function setBranchSupervisorActive(
  branchId: string,
  userId: string,
  isActive: boolean,
): Promise<UserSummary> {
  const { data } = await api.patch<UserSummary>(
    `/tenants/${branchId}/supervisors/${userId}/active`,
    { isActive },
  );
  return data;
}

export async function resetBranchSupervisorPassword(
  branchId: string,
  userId: string,
  password: string,
): Promise<UserSummary> {
  const { data } = await api.patch<UserSummary>(
    `/tenants/${branchId}/supervisors/${userId}/password`,
    { password },
  );
  return data;
}
