import type { Role } from '../user/user';

export type AuthState = {
  isAuthenticated: boolean;
  id: string | null;
  name: string | null;
  email: string | null;
  role: Role | null;
  activeTripId: string | null;
};