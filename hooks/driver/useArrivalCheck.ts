// hooks/driver/useArrivalCheck.ts
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import * as Notifications from 'expo-notifications';
import { checkOffRouteFromPolyline } from '@/location/locationService';
import { setSelectedDelivery } from '@/store/deliverySlice';
import { getDistance } from '@/constants/utils';
import type { AppDispatch } from '@/store';
import type { DeliveryItem } from '@/types/delivery/delivery';
import type { Coords } from '@/types/driver/driver';

const ARRIVAL_THRESHOLD = 100;
const OFFROUTE_THRESHOLD = 150;

export function useArrivalCheck(
  driverLocation: Coords | null,
  routePoints: Coords[],
  nextStop: DeliveryItem | null,
  activeTripId: string | null,
) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!driverLocation || !activeTripId || !nextStop) return;

    const check = async () => {
      if (routePoints.length > 0) {
        await checkOffRouteFromPolyline(
          driverLocation.latitude,
          driverLocation.longitude,
          routePoints,
          activeTripId,
          OFFROUTE_THRESHOLD,
        );
      }

      const dist = getDistance(
        driverLocation.latitude,
        driverLocation.longitude,
        nextStop.latitude,
        nextStop.longitude,
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
    };

    check();
  }, [driverLocation, routePoints, nextStop, activeTripId, dispatch]);
}