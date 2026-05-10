import { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { StyleSheet, Alert, View, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline } from 'react-native-maps';
import MapViewClustering from 'react-native-map-clustering';
import BottomSheet from '@gorhom/bottom-sheet';
import { useDispatch, useSelector } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Q } from '@nozbe/watermelondb';
import { database } from '@/services/storage/database';
import { LocationLog as LocationLogModel } from '@/services/storage/models/LocationLog';
import { Trip as TripModel } from '@/services/storage/models/Trip';
import {
  requestPermissions,
  startLocationTracking,
  stopLocationTracking,
  checkOffRoute,
} from '@/services/location/locationService';
import { endTrip, setActiveTripId } from '@/store/authSlice';
import { setSelectedDelivery } from '@/store/deliverySlice';
import { useDriverDeliveries } from '@/hooks/useDriverDeliveries';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Pressable } from '@/components/ui/pressable';
import DeliveryBottomSheet from '@/components/ui/custom/DeliveryBottomSheet';
import type { AppDispatch, RootState } from '@/store';
import type { DeliveryItem, Trip, TripStatus } from '@/types/delivery';

type DriverCoords = { latitude: number; longitude: number };

const STATUS_COLORS: Record<string, string> = {
  pending:   '#f59e0b',
  delivered: '#10b981',
  failed:    '#ef4444',
};

const TRIP_STATUS_COLOR: Record<TripStatus, string> = {
  active:    '#10b981',
  completed: '#52525b',
  cancelled: '#ef4444',
};

export default function LiveTrip() {
  const dispatch       = useDispatch<AppDispatch>();
  const activeTripId   = useSelector((s: RootState) => s.auth.activeTripId);
  const driverId       = useSelector((s: RootState) => s.auth.id);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const mapRef         = useRef<MapView>(null);

  const [driverLocation, setDriverLocation] = useState<DriverCoords | null>(null);
  const [showTripPicker, setShowTripPicker] = useState<boolean>(false);
  const [availableTrips, setAvailableTrips] = useState<Trip[]>([]);

  const { items } = useDriverDeliveries(activeTripId ?? undefined, 'pending');

  const sortedStops = useMemo(() =>
    [...items].sort((a, b) => a.sequence - b.sequence)
  , [items]);

  const nextStop    = sortedStops[0] ?? null;
  const routeCoords = useMemo(() =>
    sortedStops.map(i => ({ latitude: i.latitude, longitude: i.longitude }))
  , [sortedStops]);

  useEffect(() => {
    if (!driverId) return;

    (async (): Promise<void> => {
      const trips = await database
        .get<TripModel>('trips')
        .query(Q.where('driver_id', driverId))
        .fetch();

      setAvailableTrips(trips.map((t): Trip => ({
        id:        t.id,
        driverId:  t.driverId,
        status:    t.status as TripStatus,
        startedAt: t.startedAt,
        endedAt:   t.endedAt,
        isOffRoute: t.isOffRoute,
      })));

      if (!activeTripId) {
        const firstActive = trips.find(t => t.status === 'active');
        if (firstActive) {
          dispatch(setActiveTripId(firstActive.id));
        } else {
          setShowTripPicker(true);
        }
      }
    })();
  }, [driverId, activeTripId]);

  useEffect(() => {
    if (!activeTripId) return;

    (async (): Promise<void> => {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert(
          'Permissions Required',
          'Location and notification permissions needed.',
        );
        return;
      }
      await startLocationTracking(activeTripId);
    })();

    return () => { stopLocationTracking(); };
  }, [activeTripId]);

  useEffect(() => {
    if (!activeTripId) return;

    const subscription = database
      .get<LocationLogModel>('location_logs')
      .query(
        Q.where('trip_id', activeTripId),
        Q.sortBy('timestamp', Q.desc),
        Q.take(1),
      )
      .observe()
      .subscribe(async rows => {
        if (!rows.length) return;

        const latest = rows[0];
        const coords: DriverCoords = {
          latitude:  latest.latitude,
          longitude: latest.longitude,
        };
        setDriverLocation(coords);

        if (nextStop) {
          await checkOffRoute(
            coords.latitude,
            coords.longitude,
            nextStop,
            activeTripId,
          );
        }

        mapRef.current?.animateToRegion({
          ...coords,
          latitudeDelta:  0.05,
          longitudeDelta: 0.05,
        }, 500);
      });

    return () => subscription.unsubscribe();
  }, [activeTripId, nextStop]);

  const handleSelectTrip = useCallback(async (tripId: string): Promise<void> => {
    setShowTripPicker(false);
    dispatch(setActiveTripId(tripId));
  }, [dispatch]);

  const handleEndTrip = useCallback((): void => {
    Alert.alert(
      'End Trip',
      `End ${activeTripId?.slice(0, 12)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Trip',
          style: 'destructive',
          onPress: async () => {
            await stopLocationTracking();
            dispatch(endTrip());
            setShowTripPicker(true);
          },
        },
      ]
    );
  }, [activeTripId]);

  const handleMarkerPress = useCallback((item: DeliveryItem): void => {
    dispatch(setSelectedDelivery(item));
    bottomSheetRef.current?.expand();
  }, [dispatch]);

  const markers = useMemo(() =>
    sortedStops.map(item => (
      <Marker
        key={item.id}
        coordinate={{ latitude: item.latitude, longitude: item.longitude }}
        onPress={() => handleMarkerPress(item)}
      >
        <View style={{
          width:           32,
          height:          32,
          borderRadius:    16,
          backgroundColor: STATUS_COLORS[item.status],
          borderWidth:     2,
          borderColor:     '#fff',
          justifyContent:  'center',
          alignItems:      'center',
        }}>
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>
            {item.sequence}
          </Text>
        </View>
      </Marker>
    ))
  , [sortedStops, handleMarkerPress]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0f0f14' }}>

        <Modal
          visible={showTripPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowTripPicker(false)}
        >
          <View style={{
            flex:            1,
            backgroundColor: 'rgba(0,0,0,0.7)',
            justifyContent:  'flex-end',
          }}>
            <View style={{
              backgroundColor: '#1e1e2e',
              borderTopLeftRadius:  24,
              borderTopRightRadius: 24,
              padding: 24,
              maxHeight: '70%',
            }}>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 4 }}>
                Select Trip
              </Text>
              <Text style={{ color: '#52525b', fontSize: 13, marginBottom: 20 }}>
                Choose a trip to start tracking
              </Text>

              <FlatList
                data={availableTrips}
                keyExtractor={t => t.id}
                renderItem={({ item: t }) => (
                  <Pressable
                    onPress={() => handleSelectTrip(t.id)}
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
                        backgroundColor: TRIP_STATUS_COLOR[t.status],
                        borderRadius: 8,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
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

        <View style={{ flex: 1 }}>
          <MapViewClustering
            ref={mapRef}
            style={StyleSheet.absoluteFillObject}
            initialRegion={{
              latitude:       sortedStops[0]?.latitude ?? 12.9716,
              longitude:      sortedStops[0]?.longitude ?? 77.5946,
              latitudeDelta:  0.1,
              longitudeDelta: 0.1,
            }}
            customMapStyle={darkMapStyle}
            showsUserLocation
            clusterColor="#6366f1"
            clusterTextColor="#ffffff"
          >
            {markers}

            {routeCoords.length > 1 && (
              <Polyline
                coordinates={routeCoords}
                strokeColor="#6366f1"
                strokeWidth={3}
                lineDashPattern={[10, 5]}
              />
            )}

            {driverLocation && (
              <Marker coordinate={driverLocation} anchor={{ x: 0.5, y: 0.5 }}>
                <View style={{
                  width:           20,
                  height:          20,
                  borderRadius:    10,
                  backgroundColor: '#6366f1',
                  borderWidth:     3,
                  borderColor:     '#fff',
                  elevation:       8,
                }} />
              </Marker>
            )}
          </MapViewClustering>
        </View>

        {activeTripId && (
          <Box style={{
            position:        'absolute',
            top:             50,
            left:            16,
            right:           16,
            zIndex:          10,
            backgroundColor: 'rgba(15,15,20,0.90)',
            borderRadius:    16,
            padding:         12,
          }}>
            <HStack className="justify-between items-center">
              <VStack>
                <Text className="text-app-text-muted text-xs tracking-widest">LIVE TRIP</Text>
                <Text className="text-app-text-primary text-lg font-bold">
                  {activeTripId.slice(0, 12)}
                </Text>
                {nextStop && (
                  <Text className="text-app-text-secondary text-xs mt-1">
                    Next: Stop #{nextStop.sequence}
                  </Text>
                )}
              </VStack>
              <HStack className="gap-2 items-center">
                <Box className="bg-app-success rounded-xl px-3 py-2">
                  <Text className="text-app-text-primary text-sm font-bold">
                    {sortedStops.length} left
                  </Text>
                </Box>
                <Pressable
                  onPress={() => setShowTripPicker(true)}
                  className="bg-app-surface rounded-xl px-3 py-2"
                >
                  <Text className="text-app-text-muted text-xs">Switch</Text>
                </Pressable>
              </HStack>
            </HStack>
          </Box>
        )}

        {activeTripId && (
          <Box style={{
            position: 'absolute',
            bottom:   100,
            left:     16,
            right:    16,
            zIndex:   10,
          }}>
            <Pressable
              onPress={handleEndTrip}
              className="bg-app-danger rounded-xl py-4 items-center"
            >
              <Text className="text-app-text-primary font-bold text-base">End Trip</Text>
            </Pressable>
          </Box>
        )}

        <DeliveryBottomSheet ref={bottomSheetRef} showStatusUpdate />

      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const darkMapStyle = [
  { elementType: 'geometry',           stylers: [{ color: '#0f0f14' }] },
  { elementType: 'labels.text.fill',   stylers: [{ color: '#a1a1aa' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f0f14' }] },
  { featureType: 'road',               elementType: 'geometry',        stylers: [{ color: '#1e1e2e' }] },
  { featureType: 'road',               elementType: 'geometry.stroke', stylers: [{ color: '#2a2a3e' }] },
  { featureType: 'water',              elementType: 'geometry',        stylers: [{ color: '#0a0a10' }] },
  { featureType: 'poi',                stylers: [{ visibility: 'off' }] },
  { featureType: 'transit',            stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative',     elementType: 'geometry',        stylers: [{ color: '#2a2a3e' }] },
];