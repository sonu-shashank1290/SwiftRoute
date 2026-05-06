import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Q } from '@nozbe/watermelondb';
import { database } from '@/services/storage/database';
import { DeliveryItem as DeliveryModel } from '@/services/storage/models/DeliveryItem';
import { setItems, setLoading } from '@/store/deliverySlice';
import type { RootState } from '@/store';
import type { DeliveryItem, Status } from '@/types/delivery';

const PAGE_LIMIT = 20;

export function useDriverDeliveries(tripId?: string, statusFilter?: Status) {
    const dispatch = useDispatch();
    const { items, filter, loading } = useSelector((s: RootState) => s.deliveries);
    const driverId = useSelector((s: RootState) => s.auth.id);
    const [page, setPage] = useState<number>(0);

    useEffect(() => {
        console.log(page, "p1")
        if (!driverId) return;
        dispatch(setLoading(true));


        const subscription = database
            .get<DeliveryModel>('delivery_items')
            .query(Q.where('driver_id', driverId),
                ...(tripId ? [Q.where('trip_id', tripId)] : []),
                ...(statusFilter
                    ? [Q.where('status', statusFilter)]
                    : filter !== 'all' ? [Q.where('status', filter)] : []
                ),
                Q.skip(page * PAGE_LIMIT),
                Q.take(PAGE_LIMIT),)
            .observe()
            .subscribe(rows => {
                const mapped: DeliveryItem[] = rows.map((r): DeliveryItem => ({
                    id: r.id,
                    trackingId: r.trackingId,
                    recipient: r.recipient,
                    address: r.address,
                    status: r.status as Status,
                    latitude: r.latitude,
                    longitude: r.longitude,
                    sequence: r.sequence,
                    tripId: r.tripId,
                    userId: r.userId,
                    driverId: r.driverId,
                }));
                dispatch(setItems(page === 0 ? mapped : [...items, ...mapped]));
                dispatch(setLoading(false));
            });

        return () => subscription.unsubscribe();
    }, [driverId, page, filter, tripId, statusFilter]);

    const loadMore = useCallback((): void => setPage(p => p + 1), []);
    const resetPage = (): void => { setPage(0); dispatch(setItems([])); };

    return { items, loading, loadMore, resetPage };
}