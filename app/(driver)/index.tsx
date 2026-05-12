import { useEffect, useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import * as Notifications from 'expo-notifications';
import { database } from '@/storage/database';
import { Trip as TripModel } from '@/storage/models/Trip';
import {
    requestPermissions,
    startLocationTracking,
    stopLocationTracking,
    checkOffRouteFromPolyline,
} from '@/location/locationService';
import { useLiveLocation } from '@/hooks/driver/useLiveLocation';
import { useDriverDeliveries } from '@/hooks/driver/useDriverDeliveries';
import { endTrip, setActiveTripId } from '@/store/authSlice';
import { setSelectedDelivery } from '@/store/deliverySlice';
import TripSelectView from '@/components/driver/TripSelectView';
import LiveTripView from '@/components/driver/LiveTripView';
import type { AppDispatch, RootState } from '@/store';
import type { DeliveryItem } from '@/types/delivery/delivery';
import type { Trip, TripStatus } from '@/types/driver/driver';
import { Q } from '@nozbe/watermelondb';
import { getDistance } from '@/constants/utils';

type Coords = { latitude: number; longitude: number };

const ARRIVAL_THRESHOLD = 100; 
const OFFROUTE_THRESHOLD = 150;

export default function DriverIndex() {
  const dispatch = useDispatch<AppDispatch>();
  const activeTripId = useSelector((s: RootState) => s.auth.activeTripId);
  const driverId = useSelector((s: RootState) => s.auth.id);

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [routePoints, setRoutePoints] = useState<Coords[]>([]);
  const [routeCoords, setRouteCoords] = useState<Coords[]>([]);
  const [showPicker, setShowPicker] = useState<boolean>(false);

  const driverLocation = useLiveLocation(activeTripId);
  const { items } = useDriverDeliveries(activeTripId ?? undefined, 'pending');

  const sortedStops = useMemo(() =>
    [...items].sort((a, b) => a.sequence - b.sequence)
  , [items]);

  const nextStop = sortedStops[0] ?? null;

  useEffect(() => {
    setRouteCoords(sortedStops.map(i => ({ latitude: i.latitude, longitude: i.longitude })));
  }, [sortedStops]);

  useEffect(() => {
    setRoutePoints([]);
  }, [routeCoords]);

  useEffect(() => {
    if (!driverId) return;
    setLoading(true);
    (async () => {
      try {
        const rows = await database
          .get<TripModel>('trips')
          .query(Q.where('driver_id', driverId), Q.where('status', 'active'))
          .fetch();

        const mapped = rows.map((t): Trip => ({
          id: t.id,
          driverId: t.driverId,
          status: t.status as TripStatus,
          startedAt: t.startedAt,
          endedAt: t.endedAt,
          isOffRoute: t.isOffRoute,
        }));

        setTrips(mapped);

        if (!activeTripId) {
          const first = mapped.find(t => t.status === 'active');
          if (first) {
            dispatch(setActiveTripId(first.id));
          } else {
            setShowPicker(true);
          }
        }
      } catch (error) {
        console.error('Error loading trips:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [driverId]);

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

  useEffect(() => {
    if (!driverLocation || !activeTripId) return;

    (async () => {
      if (routePoints.length && nextStop) {
        await checkOffRouteFromPolyline(
          driverLocation.latitude,
          driverLocation.longitude,
          routePoints,
          nextStop,
          activeTripId,
          OFFROUTE_THRESHOLD,
        );
      }

      if (nextStop) {
        const dist = getDistance(
          driverLocation.latitude, driverLocation.longitude,
          nextStop.latitude, nextStop.longitude,
        );


        if (dist < ARRIVAL_THRESHOLD) {
          dispatch(setSelectedDelivery(nextStop));

          await Notifications.scheduleNotificationAsync({
            content: {
              title: '📦 Arrived at Stop',
              body: `Mark stop #${nextStop.sequence} as delivered?`,
              data: { deliveryId: nextStop.id },
            },
            trigger: null,
          });
        }
      }
    })();
  }, [driverLocation, routePoints, nextStop, activeTripId]);

  const handleSelectTrip = useCallback((tripId: string) => {
    dispatch(setActiveTripId(tripId));
    setShowPicker(false);
  }, [dispatch]);

  const handleClosePicker = useCallback(() => {
    setShowPicker(false);
  }, []);

  const handleSwitch = useCallback(() => {
    setShowPicker(true);
  }, []);

  const handleEndTrip = useCallback((): void => {
    Alert.alert('End Trip', `End ${activeTripId?.slice(0, 12)}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End Trip',
        style: 'destructive',
        onPress: async () => {
          await stopLocationTracking();
          dispatch(endTrip());
          setShowPicker(true);
        },
      },
    ]);
  }, [activeTripId]);

  const handleMarkerPress = useCallback((item: DeliveryItem): void => {
    dispatch(setSelectedDelivery(null));
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