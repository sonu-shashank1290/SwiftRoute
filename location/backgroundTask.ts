import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { database } from '@/storage/database';
import { LocationLog } from '@/storage/models/LocationLog';

export const LOCATION_TASK = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK, async ({ data, error }: TaskManager.TaskManagerTaskBody) => {
  if (error) {
    return;
  }

  const { locations } = data as { locations: Location.LocationObject[] };
  const location = locations[0];
  if (!location) return;

  const tripId = await SecureStore.getItemAsync('activeTripId');
  if (!tripId) return;

  await database.write(async () => {
    await database
      .get<LocationLog>('location_logs')
      .create(log => {
        log.latitude = location.coords.latitude;
        log.longitude = location.coords.longitude;
        log.timestamp = location.timestamp;
        log.tripId = tripId;
      });
  });
});