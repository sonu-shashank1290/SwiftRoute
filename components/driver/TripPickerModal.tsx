import { Modal, View, FlatList } from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Pressable } from '@/components/ui/pressable';
import type { Trip, TripStatus } from '@/types/driver/driver';

const TRIP_STATUS_COLOR: Record<TripStatus, string> = {
  active:    '#10b981',
  completed: '#52525b',
  cancelled: '#ef4444',
};

type Props = {
  visible: boolean;
  trips: Trip[];
  onSelect: (tripId: string) => void;
  onClose: () => void;
};

export default function TripPickerModal({ visible, trips, onSelect, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{
        flex:            1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent:  'flex-end',
      }}>
        <View style={{
          backgroundColor:      '#1e1e2e',
          borderTopLeftRadius:  24,
          borderTopRightRadius: 24,
          padding:              24,
          maxHeight:            '70%',
        }}>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 4 }}>
            Select Trip
          </Text>
          <Text style={{ color: '#52525b', fontSize: 13, marginBottom: 20 }}>
            Choose a trip to start tracking
          </Text>

          <FlatList
            data={trips}
            keyExtractor={t => t.id}
            renderItem={({ item: t }) => (
              <Pressable
                onPress={() => onSelect(t.id)}
                className="bg-app-bg rounded-xl p-4 mb-3"
              >
                <HStack className="justify-between items-center">
                  <VStack>
                    <Text className="text-app-text-primary font-bold">
                      {t.id.slice(0, 16)}
                    </Text>
                    <Text className="text-app-text-muted text-xs mt-1">
                      Started {new Date(t.startedAt).toLocaleDateString()}
                    </Text>
                  </VStack>
                  <Box style={{
                    backgroundColor:  TRIP_STATUS_COLOR[t.status],
                    borderRadius:     8,
                    paddingHorizontal: 10,
                    paddingVertical:  4,
                  }}>
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700', textTransform: 'capitalize' }}>
                      {t.status}
                    </Text>
                  </Box>
                </HStack>
              </Pressable>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}