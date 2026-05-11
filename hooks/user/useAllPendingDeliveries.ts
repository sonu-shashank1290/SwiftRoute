import { database } from "@/storage/database";
import type { RootState } from "@/store";
import { DeliveryItem, Status } from "@/types/delivery/delivery";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { DeliveryItem as DeliveryModel } from '@/storage/models/DeliveryItem';
import { Q } from "@nozbe/watermelondb";

export function useAllPendingDeliveries() {
  const userId = useSelector((s: RootState) => s.auth.id);
  const [items, setItems] = useState<DeliveryItem[]>([]);

  useEffect(() => {
    if (!userId) return;

    const sub = database
      .get<DeliveryModel>('delivery_items')
      .query(
        Q.where('user_id', userId),
        Q.where('status', 'pending'),
        Q.sortBy('sequence', Q.asc),
      )
      .observe()
      .subscribe(rows => {
        setItems(rows.map(r => ({
          id: r.id,
          trackingId: r.trackingId,
          address: r.address,
          status: r.status as Status,
          latitude: r.latitude,
          longitude: r.longitude,
          sequence: r.sequence,
          tripId: r.tripId,
          userId: r.userId,
        })));
      });

    return () => sub.unsubscribe();
  }, [userId]);

  return items;
}