import { useRef, useCallback, useMemo, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Marker, Region } from 'react-native-maps';
import MapView from 'react-native-map-clustering';
import BottomSheet from '@gorhom/bottom-sheet';
import { useDispatch, useSelector } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Location from 'expo-location';
import { setSelectedDelivery } from '@/store/deliverySlice';
import { Text } from '@/components/ui/text';
import { Box } from '@/components/ui/box';
import DeliveryBottomSheet from '@/components/ui/custom/DeliveryBottomSheet';
import type { AppDispatch, RootState } from '@/store';
import type { DeliveryItem } from '@/types/delivery';
import { useAllDeliveries } from '@/hooks/useAllDeliveries';

const FALLBACK_REGION: Region = {
  latitude: 12.9716,
  longitude: 77.5946,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

export default function UserMap() {
  const dispatch = useDispatch<AppDispatch>();
  const items = useAllDeliveries().filter(i => i.status === 'pending');
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [region, setRegion] = useState<Region | null>(null);

  useEffect(() => {
    (async (): Promise<void> => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      });
    })();
  }, []);

  const handleMarkerPress = useCallback((item: DeliveryItem): void => {
    dispatch(setSelectedDelivery(item));
    bottomSheetRef.current?.expand();
  }, [dispatch]);

  const markers = useMemo(() =>
    items.map((item: DeliveryItem) => (
      <Marker
        key={item.id}
        coordinate={{ latitude: item.latitude, longitude: item.longitude }}
        onPress={() => handleMarkerPress(item)}
      />
    )),
    [items, handleMarkerPress]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0f0f14' }}>
        <Box className="px-4 pt-2 pb-3 bg-app-bg">
          <Text className="text-app-text-muted text-xs tracking-widest">SWIFTROUTE</Text>
          <Text className="text-app-text-primary text-2xl font-bold">Map</Text>
        </Box>

        <MapView
          style={StyleSheet.absoluteFillObject}
          initialRegion={region ?? FALLBACK_REGION}
          showsUserLocation
          showsMyLocationButton
          customMapStyle={darkMapStyle}
        >
          {markers}
        </MapView>

        <DeliveryBottomSheet ref={bottomSheetRef} />

      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#0f0f14' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#a1a1aa' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f0f14' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e1e2e' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#2a2a3e' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a0a10' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#2a2a3e' }] },
];