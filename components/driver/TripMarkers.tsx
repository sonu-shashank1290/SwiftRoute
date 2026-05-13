import { Marker } from 'react-native-maps';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { memo } from 'react';
import type { DeliveryItem } from '@/types/delivery/delivery';

type Props = {
  sortedStops: DeliveryItem[];
  onMarkerPress: (item: DeliveryItem) => void;
};

const StopMarker = memo(({ item, onPress }: { item: DeliveryItem; onPress: (item: DeliveryItem) => void }) => (
  <Marker
    coordinate={{ latitude: item.latitude, longitude: item.longitude }}
    onPress={() => onPress(item)}
    tracksViewChanges={false}
  >
    <View className="w-8 h-8 rounded-full bg-app-warning border-2">
    </View>
  </Marker>
));

const TripMarkers = memo(({ sortedStops, onMarkerPress }: Props) => (
  <>
    {sortedStops.map(item => (
      <StopMarker key={item.id} item={item} onPress={onMarkerPress} />
    ))}
  </>
));

export default TripMarkers;