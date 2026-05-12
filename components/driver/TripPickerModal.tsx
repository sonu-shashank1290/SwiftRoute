import { Modal, View, FlatList } from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Pressable } from '@/components/ui/pressable';
import type { Trip, TripStatus } from '@/types/driver/driver';
import { memo, useCallback } from 'react';

const TRIP_STATUS_COLOR: Record<TripStatus, string> = {
  active: '#10b981',
  completed: '#52525b',
  cancelled: '#ef4444',
};

type Props = {
  visible: boolean;
  trips: Trip[];
  onSelect: (tripId: string) => void;
  onClose: () => void;
};

const TripPickerModal = memo(({ visible, trips, onSelect, onClose }: Props) => {
  const renderItem = useCallback(({ item: t }: { item: Trip }) => (
    <Pressable onPress={() => onSelect(t.id)} className="bg-app-bg rounded-xl p-4 mb-3">
      <HStack className="justify-between items-center">
        <VStack>
          <Text className="text-app-text-primary font-bold">{t.id.slice(0, 16)}</Text>
          <Text className="text-app-text-muted text-xs mt-1">
            Started {new Date(t.startedAt).toLocaleDateString()}
          </Text>
        </VStack>
        <Box
          className="rounded-lg px-2.5 py-1"
          style={{ backgroundColor: TRIP_STATUS_COLOR[t.status] }}
        >
          <Text className="text-white text-xs font-bold capitalize">{t.status}</Text>
        </Box>
      </HStack>
    </Pressable>
  ), [onSelect]);

  const keyExtractor = useCallback((item: Trip) => item.id, []);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/70 justify-end">
        <View className="bg-app-surface rounded-t-3xl p-6 max-h-[70%]">
          <Text className="text-app-text-primary text-xl font-bold mb-1">Select Trip</Text>
          <Text className="text-app-text-muted text-xs mb-5">Choose a trip to start tracking</Text>
          <FlatList
            data={trips}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </View>
      </View>
    </Modal>
  );
});

export default TripPickerModal;