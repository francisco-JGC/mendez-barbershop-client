import { api } from '@/lib/api';
import type { Branch } from '@/types/branch';
import type { Settings, UpdateSettingsInput } from '@/types/settings';

export async function fetchSettings(): Promise<Settings> {
  const { data } = await api.get<Settings>('/settings');
  return data;
}

export async function updateSettings(input: UpdateSettingsInput): Promise<Settings> {
  const { data } = await api.patch<Settings>('/settings', input);
  return data;
}

export async function updateCurrentBarbershop(name: string): Promise<Branch> {
  const { data } = await api.patch<Branch>('/tenants/current', { name });
  return data;
}
