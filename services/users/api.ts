import { apiClient } from '@/services/api/client';
import type { User } from './types';

export const fetchUsers = async (): Promise<User[]> => {
  const { data } = await apiClient.get('/users');
  return data;
};

export const fetchUser = async (id: number): Promise<User> => {
  const { data } = await apiClient.get(`/users/${id}`);
  return data;
};