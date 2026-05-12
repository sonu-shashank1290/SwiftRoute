import { useRef, useCallback, useMemo, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
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
import DeliveryBottomSheet from '@/components/common/DeliveryBottomSheet';
import type { AppDispatch, RootState } from '@/store';
import type { DeliveryItem } from '@/types/delivery/delivery';
import { useAllPendingDeliveries } from '@/hooks/user/useAllPendingDeliveries';
import { darkMapStyle } from '@/constants/utils';

const FALLBACK_REGION: Region = {
  latitude: 12.9716,
  longitude: 77.5946,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

export default function UserMap() {
  const dispatch = useDispatch<AppDispatch>();
  const items = useAllPendingDeliveries();
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
        <Box className="px-4 pt-2 pb-3 bg-app-bg z-10">
          <Text className="text-app-text-muted text-xs tracking-widest">SWIFTROUTE</Text>
          <Text className="text-app-text-primary text-2xl font-bold">Map</Text>
        </Box>
        <View style={{ flex: 1 }}>
          <MapView
            style={StyleSheet.absoluteFillObject}
            initialRegion={region ?? FALLBACK_REGION}
            showsUserLocation
            showsMyLocationButton
            loadingEnabled
            customMapStyle={darkMapStyle}
          >
            {markers}
          </MapView>
        </View>
        
        <DeliveryBottomSheet ref={bottomSheetRef} />

      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
