export type TripStatus = 'active' | 'completed' | 'cancelled';

export type Coords = { latitude: number; longitude: number };

export interface Trip {
  readonly id: string;
  readonly driverId: string;
  status: TripStatus;
  readonly startedAt: number;
  endedAt: number | null | undefined;
  isOffRoute: boolean;
}

export interface LocationLog {
  readonly id: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly timestamp: number;
  readonly tripId: string;
}