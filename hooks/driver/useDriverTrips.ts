import { database } from "@/storage/database";
import { Trip, TripStatus } from "@/types/driver/driver";
import { useEffect, useState } from "react";
import { Trip as TripModel } from '@/storage/models/Trip';
import { Q } from "@nozbe/watermelondb";

export function useDriverTrips(driverId: string | null, status?: TripStatus) {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);

    function mapTrip(t: TripModel): Trip {
        return {
            id: t.id,
            driverId: t.driverId,
            status: t.status as TripStatus,
            startedAt: t.startedAt,
            endedAt: t.endedAt,
            isOffRoute: t.isOffRoute,
        };
    }

    useEffect(() => {
        if (!driverId) return;
        setLoading(true);

        const conditions = [Q.where('driver_id', driverId)];
        if (status) conditions.push(Q.where('status', status));

        const query = database
            .get<TripModel>('trips')
            .query(
                ...conditions,
                Q.sortBy('started_at', Q.desc),
            );

        const sub = query.observe().subscribe(rows => {
            setTrips(rows.map(mapTrip));
            setLoading(false);
        });

        return () => sub.unsubscribe();
    }, [driverId, status]);

    return { trips, loading };
}