import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  assignBarberToStation,
  createStation,
  fetchStations,
  releaseStation,
} from '@/lib/stations-api';
import type { CreateStationInput } from '@/types/station';

const STATIONS_KEY = ['stations'];

export function useStations() {
  return useQuery({
    queryKey: STATIONS_KEY,
    queryFn: fetchStations,
  });
}

export function useCreateStation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateStationInput) => createStation(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: STATIONS_KEY });
    },
  });
}

export function useAssignBarber() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ stationId, barberId }: { stationId: string; barberId: string }) =>
      assignBarberToStation(stationId, barberId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: STATIONS_KEY });
    },
  });
}

export function useReleaseStation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (stationId: string) => releaseStation(stationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: STATIONS_KEY });
    },
  });
}
