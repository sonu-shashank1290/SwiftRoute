import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRef, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import MapView from 'react-native-maps';
import BottomSheet from '@gorhom/bottom-sheet';
import TripPickerModal from './TripPickerModal';
import TripMap from './TripMap';
import TripMarkers from './TripMarkers';
import LiveTripHeader from './LiveTripHeader';
import TripControls from './TripControls';
import DeliveryBottomSheet from '@/components/common/DeliveryBottomSheet';
import type { DeliveryItem } from '@/types/delivery/delivery';
import type { Trip } from '@/types/driver/driver';
import type { RootState } from '@/store';

type Coords = { latitude: number; longitude: number };

type Props = {
  activeTripId: string;
  showPicker: boolean;
  trips: Trip[];
  sortedStops: DeliveryItem[];
  routeCoords: Coords[];
  driverLocation: Coords | null;
  nextStop: DeliveryItem | null;
  onSelectTrip: (tripId: string) => void;
  onClosePicker: () => void;
  onSwitch: () => void;
  onEndTrip: () => void;
  onMarkerPress: (item: DeliveryItem) => void;
  onRouteReady: (result: any) => void;
};

export default function LiveTripView({
  activeTripId,
  showPicker,
  trips,
  sortedStops,
  routeCoords,
  driverLocation,
  nextStop,
  onSelectTrip,
  onClosePicker,
  onSwitch,
  onEndTrip,
  onMarkerPress,
  onRouteReady,
}: Props) {
  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const selectedDelivery = useSelector((state: RootState) => state.deliveries.selectedDelivery);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    if (selectedDelivery) {
      timeout = setTimeout(() => {
        bottomSheetRef.current?.expand();
        setIsSheetOpen(true);
      }, 50);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [selectedDelivery]);

  const markers = (
    <TripMarkers sortedStops={sortedStops} onMarkerPress={onMarkerPress} />
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0f0f14' }}>
        <TripPickerModal
          visible={showPicker}
          trips={trips}
          onSelect={onSelectTrip}
          onClose={onClosePicker}
        />

        <TripMap
          mapRef={mapRef}
          sortedStops={sortedStops}
          routeCoords={routeCoords}
          driverLocation={driverLocation}
          markers={markers}
          onRouteReady={onRouteReady}
        />

        <LiveTripHeader
          activeTripId={activeTripId}
          nextStop={nextStop}
          stopsLeft={sortedStops.length}
          onSwitch={onSwitch}
        />

        <TripControls onEndTrip={onEndTrip} />

        <DeliveryBottomSheet ref={bottomSheetRef} showStatusUpdate />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}