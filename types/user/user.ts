export type Role = 'user' | 'driver';

export interface User {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: Role;
  readonly address: string;
  readonly latitude: number;
  readonly longitude: number;
}