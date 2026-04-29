import { database } from './database';
import { DeliveryItem } from './models/DeliveryItem';

const STATUSES = ['pending', 'delivered', 'failed'] as const;

// Bangalore area coords
const BASE_LAT = 12.9716;
const BASE_LNG = 77.5946;

export async function seedDeliveries() {
  const collection = database.get<DeliveryItem>('delivery_items');
  const count = await collection.query().fetchCount();
  if (count > 0) return;

  await database.write(async () => {
    const batch = Array.from({ length: 1000 }, (_, i) =>
      collection.prepareCreate(item => {
        item.trackingId = `TRK-${String(i + 1).padStart(5, '0')}`;
        item.recipient  = `Recipient ${i + 1}`;
        item.address    = `${i + 1} Main St, City ${(i % 50) + 1}`;
        item.status     = STATUSES[i % 3];
        item.latitude   = BASE_LAT + (Math.random() - 0.5) * 0.5;
        item.longitude  = BASE_LNG + (Math.random() - 0.5) * 0.5;
        item.sequence   = i + 1;
        item.userId     = 'USER-001';
        item.tripId     = `TRIP-${String(Math.floor(i / 50) + 1).padStart(3, '0')}`;
      })
    );
    await database.batch(...batch);
  });
}