export type Status = 'pending' | 'delivered' | 'failed';
export type TripStatus = 'active' | 'completed' | 'cancelled';
export type Role = 'user' | 'driver';

export interface DeliveryItem {
  readonly id: string;
  readonly trackingId: string;
  readonly address: string;
  status: Status;
  readonly latitude: number;
  readonly longitude: number;
  readonly sequence: number;
  readonly tripId: string;
  readonly userId: string;
  readonly driverId?: string;
}

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

export interface User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: Role;
  readonly address: string;
  readonly latitude: number;
  readonly longitude: number;
}