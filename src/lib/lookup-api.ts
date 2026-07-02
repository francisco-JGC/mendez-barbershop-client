import { api } from '@/lib/api';

export interface BarbershopLookup {
  name: string;
  logo: string | null;
  isActive: boolean;
}

export async function lookupBarbershop(code: string): Promise<BarbershopLookup> {
  const { data } = await api.get<BarbershopLookup>(
    `/tenants/lookup/${encodeURIComponent(code)}`,
  );
  return data;
}
