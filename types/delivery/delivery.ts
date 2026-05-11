import type { Role } from '../user/user';

export type Status = 'pending' | 'delivered' | 'failed';
export type FilterType = 'all' | 'pending' | 'delivered' | 'failed';

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