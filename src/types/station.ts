export const StationStatus = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
} as const;

export type StationStatus = (typeof StationStatus)[keyof typeof StationStatus];

export interface Station {
  id: string;
  barbershopId: string;
  number: number;
  status: StationStatus;
  currentBarberId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStationInput {
  number: number;
}
