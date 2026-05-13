import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { memo } from 'react';
import type { User } from '@/services/users/types';

type Props = {
  item: User;
  onPress: (user: User) => void;
  selected: boolean;
};

const UserCard = memo(({ item, onPress, selected }: Props) => (
  <Pressable
    onPress={() => onPress(item)}
    className={`rounded-2xl p-4 mb-3 border ${selected
      ? 'bg-app-brand border-app-brand'
      : 'bg-app-surface border-app-border'
    }`}
  >
    <View className="flex-row items-center gap-3">
      <View className="w-10 h-10 rounded-full bg-app-brand justify-center items-center">
        <Text className="text-app-text-primary font-bold text-sm">
          {item.name.charAt(0)}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="text-app-text-primary font-bold">{item.name}</Text>
        <Text className="text-app-text-muted text-xs">{item.email}</Text>
      </View>
      <View className="bg-app-bg rounded-lg px-2 py-1">
        <Text className="text-app-text-secondary text-xs">{item.address.city}</Text>
      </View>
    </View>
  </Pressable>
));

export default UserCard;