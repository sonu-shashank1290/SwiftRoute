import { useQuery } from '@tanstack/react-query';
import { fetchUsers, fetchUser } from '@/services/users/api';

export const userKeys = {
  all: ['users'] as const,
  detail: (id: number) => ['users', id] as const,
};

export const useUsers = () =>
  useQuery({ queryKey: userKeys.all, queryFn: fetchUsers });

export const useUser = (id: number) =>
  useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => fetchUser(id),
    enabled: !!id,
  });