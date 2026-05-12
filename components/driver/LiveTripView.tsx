import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRef, useEffect, useState, useMemo } from 'react';
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
import type { Coords } from '@/types/driver/driver';

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

  const selectedDelivery = useSelector((state: RootState) => state.deliveries.selectedDelivery);

  useEffect(() => {
  if (!selectedDelivery) {
    bottomSheetRef.current?.close();
    return;
  }
  
  const id = setTimeout(() => {
    bottomSheetRef.current?.expand();
  }, 100);
  
  return () => clearTimeout(id);
}, [selectedDelivery]);

  const markers = useMemo(() => (
    <TripMarkers sortedStops={sortedStops} onMarkerPress={onMarkerPress} />
  ), [sortedStops, onMarkerPress]);

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