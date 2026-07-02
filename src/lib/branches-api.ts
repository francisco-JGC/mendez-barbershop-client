import { api } from '@/lib/api';
import type {
  Branch,
  CreateBranchAdminInput,
  CreateBranchInput,
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

export async function createBranchAdmin(
  branchId: string,
  input: CreateBranchAdminInput,
): Promise<UserSummary> {
  const { data } = await api.post<UserSummary>(
    `/tenants/${branchId}/admin`,
    input,
  );
  return data;
}

export async function fetchBranchAdmins(branchId: string): Promise<UserSummary[]> {
  const { data } = await api.get<UserSummary[]>(`/tenants/${branchId}/admins`);
  return data;
}

export async function updateBranchAdmin(
  branchId: string,
  userId: string,
  input: UpdateUserInput,
): Promise<UserSummary> {
  const { data } = await api.patch<UserSummary>(
    `/tenants/${branchId}/admins/${userId}`,
    input,
  );
  return data;
}

export async function setBranchAdminActive(
  branchId: string,
  userId: string,
  isActive: boolean,
): Promise<UserSummary> {
  const { data } = await api.patch<UserSummary>(
    `/tenants/${branchId}/admins/${userId}/active`,
    { isActive },
  );
  return data;
}

export async function resetBranchAdminPassword(
  branchId: string,
  userId: string,
  password: string,
): Promise<UserSummary> {
  const { data } = await api.patch<UserSummary>(
    `/tenants/${branchId}/admins/${userId}/password`,
    { password },
  );
  return data;
}
