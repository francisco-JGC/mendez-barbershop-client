import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createService, fetchServices, updateService } from '@/lib/catalog-api';
import type { CreateServiceInput, UpdateServiceInput } from '@/types/catalog';

const SERVICES_KEY = ['services'];

export function useServices() {
  return useQuery({
    queryKey: SERVICES_KEY,
    queryFn: fetchServices,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateServiceInput) => createService(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SERVICES_KEY });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateServiceInput }) =>
      updateService(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: SERVICES_KEY });
    },
  });
}
