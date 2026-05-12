import { Trip, User, DeliveryItem } from './models';
import { database } from './database';
import { Status } from '@/types/delivery/delivery';
import type { Coords as LatLng } from '@/types/driver/driver';

function uid() {
    return Math.random().toString(36).slice(2, 10).toUpperCase();
}
let isSeeding = false;

function nowMinus(ms: number) {
    return Date.now() - ms;
}

const MIN = 60_000;
const HR = 60 * MIN;
const DAY = 24 * HR;

const DRIVER = {
    id: 'DRV-001',
    name: 'Vikram Dass',
    email: 'vikram@swiftroute.in',
    role: 'driver',
} as const;

const CUSTOMERS = [
    {
        id: 'USER-001',
        name: 'Arjun Sharma',
        email: 'arjun@example.in',
        address: '14 MG Road, Bengaluru 560001',
        lat: 12.9752,
        lng: 77.6064,
        role: 'customer',
    },
    {
        id: 'USER-002',
        name: 'Priya Nair',
        email: 'priya@example.in',
        address: '7 Koramangala 5th Block, Bengaluru 560095',
        lat: 12.9352,
        lng: 77.6245,
        role: 'customer',
    },
] as const;

type TripStatus = 'active' | 'completed' | 'cancelled';

interface TripDef {
    status: TripStatus;
    startedAgo: number;
    durationMs: number;
}

const TRIP_DEFS: TripDef[] = [
    { status: 'active', startedAgo: 1 * HR, durationMs: 0 },
    { status: 'active', startedAgo: 2 * HR, durationMs: 0 },
    { status: 'completed', startedAgo: 1 * DAY, durationMs: 5 * HR },
    { status: 'completed', startedAgo: 2 * DAY, durationMs: 6 * HR },
    { status: 'completed', startedAgo: 3 * DAY, durationMs: 5 * HR },
    { status: 'completed', startedAgo: 4 * DAY, durationMs: 4 * HR },
    { status: 'completed', startedAgo: 5 * DAY, durationMs: 7 * HR },
    { status: 'cancelled', startedAgo: 3 * DAY + HR, durationMs: 1 * HR },
];


function generateSequentialLocations(count: number): LatLng[] {
    const baseLat = 12.910384;
    const baseLng = 77.601579;

    const locations: LatLng[] = [];
    let currentLat = baseLat;
    let currentLng = baseLng;

    // Generate locations in a roughly northeast direction with some variation
    const stepLat = 0.008; // ~800m north - increased for more spacing
    const stepLng = 0.008; // ~800m east - increased for more spacing

    for (let i = 0; i < count; i++) {
        // Add some small random variation to make it look natural
        const jitterLat = (Math.random() - 0.5) * 0.0005;
        const jitterLng = (Math.random() - 0.5) * 0.0005;

        currentLat += stepLat + jitterLat;
        currentLng += stepLng + jitterLng;

        locations.push({
            latitude: currentLat,
            longitude: currentLng,
        });
    }

    return locations;
}

export async function seedDatabase(): Promise<void> {
    if (isSeeding) return;
    isSeeding = true;
    try {
        const existingItems = await database
            .get('delivery_items')
            .query()
            .fetchCount();

        const existingUsers = await database
            .get('users')
            .query()
            .fetchCount();

        if (existingItems > 0 && existingUsers > 0) {
            return;
        }

        await database.write(async () => {
            for (const u of [DRIVER, ...CUSTOMERS]) {
                await database.get<User>('users').create((rec: any) => {
                    rec._raw.id = u.id;

                    rec.name = u.name;
                    rec.email = u.email;
                    rec.role = u.role;

                    if ('address' in u) rec.address = u.address;
                    if ('lat' in u) rec.latitude = u.lat;
                    if ('lng' in u) rec.longitude = u.lng;

                    rec._raw.created_at = Date.now();

                });
            }

            const TOTAL_ITEMS = 1000;
            const ITEMS_PER_TRIP = 25

            let globalSeq = 1;
            let itemsWritten = 0;
            let customerToggle = 0;
            const totalTrips = Math.ceil(TOTAL_ITEMS / ITEMS_PER_TRIP);

            for (let ti = 0; ti < totalTrips; ti++) {
                const def = TRIP_DEFS[ti % TRIP_DEFS.length];

                const tripId = `TRP-${uid()}`;

                const startTs = nowMinus(def.startedAgo);

                const endTs =
                    def.status !== 'active'
                        ? startTs + def.durationMs
                        : undefined;

                await database.get<Trip>('trips').create((t: any) => {
                    t._raw.id = tripId;
                    t.driverId = DRIVER.id;
                    t.status = def.status;
                    t.startedAt = new Date(startTs);
                    t.endedAt = endTs ? new Date(endTs) : null;
                    t.isOffRoute = false;
                });

                const isLast = ti === totalTrips - 1;

                const batchSize = isLast
                    ? TOTAL_ITEMS - itemsWritten
                    : ITEMS_PER_TRIP;

                const tripLocations = generateSequentialLocations(batchSize);

                for (let i = 0; i < batchSize; i++) {
                    const customer =
                        CUSTOMERS[customerToggle % CUSTOMERS.length];
                    const location = tripLocations[i];

                    customerToggle++;

                    let status: Status;

                    if (def.status === 'active') {
                        const completedStops = Math.floor(batchSize * 0.4);

                        status =
                            i < completedStops
                                ? 'delivered'
                                : 'pending';
                    }

                    else if (def.status === 'completed') {
                        status = Math.random() < 0.9
                            ? 'delivered'
                            : 'failed';
                    }

                    else {
                        const r = Math.random();

                        if (r < 0.5) status = 'failed';
                        else if (r < 0.9) status = 'pending';
                        else status = 'delivered';
                    }

                    await database
                        .get<DeliveryItem>('delivery_items')
                        .create((d: any) => {
                            d._raw.id = `DEL-${uid()}`;
                            d.trackingId = `SWR-${String(globalSeq).padStart(5, '0')}`;
                            d.status = status;
                            d.sequence = i + 1;
                            d.tripId = tripId;
                            d.userId = customer.id;
                            d.driverId = DRIVER.id;
                            d.address = customer.address;
                            d.latitude = location.latitude;
                            d.longitude = location.longitude;

                            d._raw.created_at =
                                startTs +
                                Math.floor(Math.random() * (def.durationMs || HR));
                        });

                    itemsWritten++;
                }
            }
        });
    } finally {
        isSeeding = false;
    }

}