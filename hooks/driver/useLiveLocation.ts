import { useEffect, useState } from 'react';
import { Q } from '@nozbe/watermelondb';
import { database } from '@/storage/database';
import { LocationLog as LocationLogModel } from '@/storage/models/LocationLog';
import type { Coords } from '@/types/driver/driver';

export function useLiveLocation(tripId: string | null) {
    const [location, setLocation] = useState<Coords | null>(null);

    useEffect(() => {
        if (!tripId) return;

        const subscription = database
            .get<LocationLogModel>('location_logs')
            .query(
                Q.where('trip_id', tripId),
                Q.sortBy('timestamp', Q.desc),
                Q.take(1),
            )
            .observe()
            .subscribe(rows => {
                if (!rows.length) return;
                setLocation({
                    latitude: rows[0].latitude,
                    longitude: rows[0].longitude,
                });
            });

        return () => subscription.unsubscribe();
    }, [tripId]);

    return location;
}