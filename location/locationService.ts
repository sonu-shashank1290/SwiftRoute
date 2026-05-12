import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import { database } from '@/storage/database';
import { Trip as TripModel } from '@/storage/models/Trip';
import { LOCATION_TASK } from './backgroundTask';
import type { DeliveryItem } from '@/types/delivery/delivery';

function getDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function checkOffRouteFromPolyline(
  driverLat: number,
  driverLng: number,
  routePoints: { latitude: number; longitude: number }[],
  nextStop: DeliveryItem,
  tripId: string,
  threshold: number = 50,
): Promise<void> {
  if (!routePoints.length) return;
  const minDistance = Math.min(
    ...routePoints.map(p =>
      getDistance(driverLat, driverLng, p.latitude, p.longitude)
    )
  );

  const trip = await database.get<TripModel>('trips').find(tripId);

  if (minDistance > threshold) {
    if (!trip.isOffRoute) {
      await database.write(async () => {
        await trip.update(t => { t.isOffRoute = true; });
      });

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⚠️ Off Route',
          body: `You are ${Math.round(minDistance)}m from the planned route`,
          data: { tripId },
        },
        trigger: null,
      });
    }
  } else {
    if (trip.isOffRoute) {
      await database.write(async () => {
        await trip.update(t => { t.isOffRoute = false; });
      });
    }
  }
}

export async function requestPermissions(): Promise<boolean> {
  const { status: fg } = await Location.requestForegroundPermissionsAsync();
  if (fg !== 'granted') return false;

  const { status: bg } = await Location.requestBackgroundPermissionsAsync();
  if (bg !== 'granted') return false;

  const { status: notif } = await Notifications.requestPermissionsAsync();
  if (notif !== 'granted') return false;

  return true;
}

export async function startLocationTracking(tripId: string): Promise<void> {
  await SecureStore.setItemAsync('activeTripId', tripId);

  const isTracking = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK)
    .catch(() => false);

  if (isTracking) return;

  await Location.startLocationUpdatesAsync(LOCATION_TASK, {
    accuracy: Location.Accuracy.Balanced,
    timeInterval: 10000,
    distanceInterval: 10,
    foregroundService: {
      notificationTitle: 'SwiftRoute',
      notificationBody: 'Tracking your delivery route',
      notificationColor: '#6366f1',
    },
    pausesUpdatesAutomatically: false,
    showsBackgroundLocationIndicator: true,

  });
}

export async function stopLocationTracking(): Promise<void> {
  await SecureStore.deleteItemAsync('activeTripId');

  const isTracking = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK)
    .catch(() => false);

  if (isTracking) {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK);
  }
}

export async function checkOffRoute(
  driverLat: number,
  driverLng: number,
  nextStop: DeliveryItem,
  tripId: string,
  threshold: number = 1000,
): Promise<void> {
  const distance = getDistance(
    driverLat, driverLng,
    nextStop.latitude, nextStop.longitude,
  );

  if (distance > threshold) {
    await database.write(async () => {
      const trip = await database.get<TripModel>('trips').find(tripId);
      await trip.update(t => { t.isOffRoute = true; });
    });
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ Off Route',
        body: `You are ${Math.round(distance)}m from stop #${nextStop.sequence}`,
        data: { tripId },
      },
      trigger: null,
    });
  }
}