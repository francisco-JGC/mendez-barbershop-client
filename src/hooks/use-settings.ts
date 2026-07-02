import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchSettings, updateSettings, updateCurrentBarbershop } from '@/lib/settings-api';
import type { UpdateSettingsInput } from '@/types/settings';

const SETTINGS_KEY = ['settings'];

export function useSettings() {
  return useQuery({
    queryKey: SETTINGS_KEY,
    queryFn: fetchSettings,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateSettingsInput) => updateSettings(input),
    onSuccess: (data) => {
      queryClient.setQueryData(SETTINGS_KEY, data);
    },
  });
}

export function useUpdateCurrentBarbershop() {
  return useMutation({
    mutationFn: (name: string) => updateCurrentBarbershop(name),
  });
}
