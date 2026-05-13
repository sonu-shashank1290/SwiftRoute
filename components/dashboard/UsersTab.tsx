import { FlatList, ActivityIndicator } from 'react-native';
import { Text } from '@/components/ui/text';
import { memo, useCallback } from 'react';
import { useUsers } from '@/hooks/users/useUsers';
import { useDashboardStore } from '@/store/dashboardStore';
import UserCard from './UserCard';
import type { User } from '@/services/users/types';

const UsersTab = memo(() => {
  const { data: users, isLoading, isError } = useUsers();
  const { selectedUser, setSelectedUser } = useDashboardStore();

  const handlePress = useCallback((user: User) => {
    setSelectedUser(selectedUser?.id === user.id ? null : user);
  }, [selectedUser, setSelectedUser]);

  const keyExtractor = useCallback((item: User) => String(item.id), []);

  const renderItem = useCallback(({ item }: { item: User }) => (
    <UserCard
      item={item}
      onPress={handlePress}
      selected={selectedUser?.id === item.id}
    />
  ), [handlePress, selectedUser]);

  if (isLoading) return <ActivityIndicator color="#6366f1" className="mt-8" />;
  if (isError) return (
    <Text className="text-app-danger text-center mt-8">Failed to load users</Text>
  );

  return (
    <FlatList
      data={users}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
});

export default UsersTab;