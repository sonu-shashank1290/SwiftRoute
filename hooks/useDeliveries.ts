import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Q } from '@nozbe/watermelondb';
import { database } from '@/services/storage/database';
import { DeliveryItem as DeliveryModel } from '@/services/storage/models/DeliveryItem';
import { setItems, setLoading } from '@/store/deliverySlice';
import type { AppDispatch, RootState } from '@/store';
import type { DeliveryItem, Status } from '@/types/delivery';

const PAGE_LIMIT = 20;

export function useDeliveries() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, filter, loading } = useSelector((s: RootState) => s.deliveries);
  const userId = useSelector((s: RootState) => s.auth.id);
  const [page, setPage] = useState<number>(0);

  useEffect(() => {
    if (!userId) return;
    dispatch(setLoading(true));
    const subscription = database
      .get<DeliveryModel>('delivery_items')
      .query(
        Q.where('user_id', userId),
        ...(filter !== 'all' ? [Q.where('status', filter)] : []),
        Q.sortBy('sequence', Q.asc),
        Q.skip(page * PAGE_LIMIT),
        Q.take(PAGE_LIMIT),
      )
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
        }));
        dispatch(setItems(page === 0 ? mapped : [...items, ...mapped]));
        dispatch(setLoading(false));
      });

    return () => subscription.unsubscribe();
  }, [userId, page, filter]);

  const loadMore = (): void => setPage(p => p + 1);
  const resetPage = (): void => { setPage(0); dispatch(setItems([])); };

  return { items, loading, loadMore, resetPage };
}