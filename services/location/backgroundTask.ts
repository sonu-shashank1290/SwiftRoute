import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { database } from '@/services/storage/database';
import { LocationLog } from '@/services/storage/models/LocationLog';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const LOCATION_TASK = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK, async ({ data, error }: TaskManager.TaskManagerTaskBody) => {
    if (error) {
        console.error('Location task error:', error);
        return;
    }

    const { locations } = data as { locations: Location.LocationObject[] };
    const location = locations[0];
    if (!location) return;

    const tripId = await AsyncStorage.getItem('activeTripId');
    if (!tripId) return;

    await database.write(async () => {
        await database
            .get<LocationLog>('location_logs')
            .create(log => {
                log.latitude = location.coords.latitude;
                log.longitude = location.coords.longitude;
                log.timestamp = new Date(location.timestamp).toLocaleString();
                log.tripId = tripId;
            });
    });
});