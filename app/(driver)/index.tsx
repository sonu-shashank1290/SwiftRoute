import { useEffect, useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { database } from '@/storage/database';
import { Trip as TripModel } from '@/storage/models/Trip';
import { DeliveryItem as DeliveryModel } from '@/storage/models/DeliveryItem';
import {
  requestPermissions,
  startLocationTracking,
  stopLocationTracking,
} from '@/location/locationService';
import { useLiveLocation } from '@/hooks/driver/useLiveLocation';
import { useDriverDeliveries } from '@/hooks/driver/useDriverDeliveries';
import { useArrivalCheck } from '@/hooks/driver/useArrivalCheck';
import { endTrip, setActiveTripId } from '@/store/authSlice';
import { setSelectedDelivery } from '@/store/deliverySlice';
import TripSelectView from '@/components/driver/TripSelectView';
import LiveTripView from '@/components/driver/LiveTripView';
import type { AppDispatch, RootState } from '@/store';
import type { DeliveryItem } from '@/types/delivery/delivery';
import type { Coords } from '@/types/driver/driver';
import { useDriverTrips } from '@/hooks/driver/useDriverTrips';



export default function DriverIndex() {
  const dispatch = useDispatch<AppDispatch>();
  const activeTripId = useSelector((s: RootState) => s.auth.activeTripId);
  const driverId = useSelector((s: RootState) => s.auth.id);
  const [routePoints, setRoutePoints] = useState<Coords[]>([]);
  const [showPicker, setShowPicker] = useState<boolean>(true);

  const driverLocation = useLiveLocation(activeTripId);
  const { items } = useDriverDeliveries(activeTripId ?? undefined, 'pending');

  const sortedStops = useMemo(() =>
    [...items].sort((a, b) => a.sequence - b.sequence)
    , [items]);

  const nextStop = useMemo(() => sortedStops[0] ?? null, [sortedStops]);

  const routeCoords = useMemo(() =>
    sortedStops.map(i => ({ latitude: i.latitude, longitude: i.longitude }))
    , [sortedStops]);

  const { trips, loading } = useDriverTrips(driverId, 'active');

  useEffect(() => {
    if (!activeTripId) return;
    (async () => {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert('Permissions Required', 'Location permissions needed.');
        return;
      }
      await startLocationTracking(activeTripId);
    })();
    return () => { stopLocationTracking(); };
  }, [activeTripId]);

  useArrivalCheck(driverLocation, routePoints, nextStop, activeTripId);


  const handleSelectTrip = useCallback((tripId: string) => {
    dispatch(setActiveTripId(tripId));
    setShowPicker(false);
  }, [dispatch]);

  const handleSwitch = useCallback(() => setShowPicker(true), []);
  const handleClosePicker = useCallback(() => setShowPicker(false), []);

  const handleEndTrip = useCallback((): void => {
    Alert.alert('End Trip', `End ${activeTripId?.slice(0, 12)}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End Trip',
        style: 'destructive',
        onPress: async () => {
          try {
            await stopLocationTracking();

            const pendingItems = items.filter((i: DeliveryItem) => i.status === 'pending');
            if (pendingItems.length > 0) {
              await database.write(async () => {
                for (const item of pendingItems) {
                  const record = await database
                    .get<DeliveryModel>('delivery_items')
                    .find(item.id);
                  await record.update(r => { r.status = 'failed'; });
                }
              });
            }

            if (activeTripId) {
              await database.write(async () => {
                const trip = await database
                  .get<TripModel>('trips')
                  .find(activeTripId);
                await trip.update(t => {
                  t.status = 'completed';
                  t.endedAt = Date.now();
                });
              });
            }

            dispatch(endTrip());
            setShowPicker(true);
          } catch (error) {
            Alert.alert('Error', 'Failed to end trip. Please try again.');
          }
        },
      },
    ]);
  }, [activeTripId, items, dispatch]);

  const handleMarkerPress = useCallback((item: DeliveryItem): void => {
    dispatch(setSelectedDelivery(item));
  }, [dispatch]);

  const handleRouteReady = useCallback((result: any) => {
    if (result.coordinates && result.coordinates.length > 0) {
      setRoutePoints(result.coordinates);
    }
  }, []);

  if (activeTripId) {
    return (
      <LiveTripView
        activeTripId={activeTripId}
        showPicker={showPicker}
        trips={trips}
        sortedStops={sortedStops}
        routeCoords={routeCoords}
        driverLocation={driverLocation}
        nextStop={nextStop}
        onSelectTrip={handleSelectTrip}
        onClosePicker={handleClosePicker}
        onSwitch={handleSwitch}
        onEndTrip={handleEndTrip}
        onMarkerPress={handleMarkerPress}
        onRouteReady={handleRouteReady}
      />
    );
  }

  return (
    <TripSelectView
      loading={loading}
      showPicker={showPicker}
      trips={trips}
      onSelect={handleSelectTrip}
      onClose={handleClosePicker}
    />
  );
}