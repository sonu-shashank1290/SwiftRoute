import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Q } from '@nozbe/watermelondb';
import { database } from '@/services/storage/database';
import { DeliveryItem } from '@/services/storage/models/DeliveryItem';
import { setItems, setLoading } from '@/store/deliverySlice';
import type { RootState } from '@/store';

export function useDeliveries() {
  const dispatch = useDispatch();
  const { items, filter, loading } = useSelector((s: RootState) => s.deliveries);
  const userId = useSelector((s: RootState) => s.auth.id);

  useEffect(() => {
    if (!userId) return;
    dispatch(setLoading(true));

    const subscription = database
      .get<DeliveryItem>('delivery_items')
      .query(Q.where('user_id', userId))
      .observe()
      .subscribe(rows => {
        dispatch(setItems(rows.map(r => ({
          id:        r.id,
          trackingId: r.trackingId,
          recipient:  r.recipient,
          address:    r.address,
          status:     r.status as 'pending' | 'delivered' | 'failed',
          latitude:   r.latitude,
          longitude:  r.longitude,
          sequence:   r.sequence,
          tripId:     r.tripId,
          userId:     r.userId,
        }))));
        dispatch(setLoading(false));
      });

    return () => subscription.unsubscribe();
  }, [userId]);

  const filtered = filter === 'all' ? items : items.filter(i => i.status === filter);
  return { items: filtered, loading };
}