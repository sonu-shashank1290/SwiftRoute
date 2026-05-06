export type Status = 'pending' | 'delivered' | 'failed';
export type Role = 'user' | 'driver';

export type DeliveryItem = {
  id: string;
  trackingId: string;
  recipient: string;
  address: string;
  status: Status;
  latitude: number;
  longitude: number;
  sequence?: number;
  tripId?: string;
  userId: string;
  driverId?: string;
};

export type LocationLog = {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: number;
  tripId: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type FilterType = 'all' | Status;