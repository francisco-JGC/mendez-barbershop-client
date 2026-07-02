import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { updateCurrentBarbershop } from '@/lib/settings-api';
import type { Branch } from '@/types/branch';

const CURRENT_BARBERSHOP_KEY = ['tenants', 'current'];

async function fetchCurrentBarbershop(): Promise<Branch> {
  const { data } = await api.get<Branch>('/tenants/current');
  return data;
}

export function useCurrentBarbershop(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: CURRENT_BARBERSHOP_KEY,
    queryFn: fetchCurrentBarbershop,
    staleTime: 60_000,
    enabled: options?.enabled ?? true,
  });
}

export function useUpdateBarbershopName() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => updateCurrentBarbershop(name),
    onSuccess: (data) => {
      queryClient.setQueryData(CURRENT_BARBERSHOP_KEY, data);
    },
  });
}
