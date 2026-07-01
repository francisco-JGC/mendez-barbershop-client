import { api } from '@/lib/api';
import type { CreateStationInput, Station } from '@/types/station';

export async function fetchStations(): Promise<Station[]> {
  const { data } = await api.get<Station[]>('/stations');
  return data;
}

export async function createStation(input: CreateStationInput): Promise<Station> {
  const { data } = await api.post<Station>('/stations', input);
  return data;
}

export async function assignBarberToStation(
  stationId: string,
  barberId: string,
): Promise<Station> {
  const { data } = await api.patch<Station>(`/stations/${stationId}/assign`, {
    barberId,
  });
  return data;
}

export async function releaseStation(stationId: string): Promise<Station> {
  const { data } = await api.patch<Station>(`/stations/${stationId}/release`);
  return data;
}
