import { api } from '@/lib/api';
import type {
  Branch,
  CreateBranchAdminInput,
  CreateBranchInput,
} from '@/types/branch';
import type { UserSummary } from '@/types/user';

export async function fetchBranches(): Promise<Branch[]> {
  const { data } = await api.get<Branch[]>('/tenants');
  return data;
}

export async function createBranch(input: CreateBranchInput): Promise<Branch> {
  const { data } = await api.post<Branch>('/tenants', input);
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
