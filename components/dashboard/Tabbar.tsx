import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { memo } from 'react';

type Tab = 'users' | 'posts';

type Props = {
  active: Tab;
  onPress: (tab: Tab) => void;
};

const TabBar = memo(({ active, onPress }: Props) => (
  <View className="flex-row bg-app-surface rounded-2xl p-1 mb-4">
    {(['users', 'posts'] as const).map(tab => (
      <Pressable
        key={tab}
        onPress={() => onPress(tab)}
        className={`flex-1 py-2 rounded-xl items-center ${active === tab ? 'bg-app-brand' : ''}`}
      >
        <Text className={`text-sm font-bold capitalize ${active === tab
          ? 'text-app-text-primary'
          : 'text-app-text-muted'
        }`}>
          {tab}
        </Text>
      </Pressable>
    ))}
  </View>
));

export default TabBar;