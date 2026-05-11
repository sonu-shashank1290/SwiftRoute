import { View } from 'react-native';
import { Marker } from 'react-native-maps';
import { Text } from '@/components/ui/text';
import type { DeliveryItem } from '@/types/delivery/delivery';

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  delivered: '#10b981',
  failed: '#ef4444',
};

type Props = {
  sortedStops: DeliveryItem[];
  onMarkerPress: (item: DeliveryItem) => void;
};

export default function TripMarkers({ sortedStops, onMarkerPress }: Props) {
  return (
    <>
      {sortedStops.map(item => (
        <Marker
          key={item.id}
          coordinate={{ latitude: item.latitude, longitude: item.longitude }}
          onPress={() => onMarkerPress(item)}
        >
          <View style={{
            width: 32, height: 32, borderRadius: 16,
            backgroundColor: STATUS_COLORS[item.status],
            borderWidth: 2, borderColor: '#fff',
            justifyContent: 'center', alignItems: 'center',
          }}>
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>
              {item.sequence}
            </Text>
          </View>
        </Marker>
      ))}
    </>
  );
}