import { Trip, User, DeliveryItem } from './models';
import { database } from './database';

function uid() {
    return Math.random().toString(36).slice(2, 10).toUpperCase();
}

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

function randomNearbyLocation() {
    const baseLat = 12.910384;
    const baseLng = 77.601579;

    // ~ up to 8-10km spread
    const latOffset = (Math.random() - 0.5) * 0.12;
    const lngOffset = (Math.random() - 0.5) * 0.12;

    return {
        latitude: baseLat + latOffset,
        longitude: baseLng + lngOffset,
    };
}

function itemStatus(
    tripStatus: TripStatus,
): 'pending' | 'delivered' | 'failed' {
    const r = Math.random();

    if (tripStatus === 'active') {
        if (r < 0.5) return 'pending';
        if (r < 0.85) return 'delivered';
        return 'failed';
    }

    if (tripStatus === 'completed') {
        if (r < 0.85) return 'delivered';
        if (r < 0.95) return 'failed';
        return 'pending';
    }


    if (r < 0.6) return 'failed';
    if (r < 0.9) return 'pending';

    return 'delivered';
}

export async function seedDatabase(): Promise<void> {
    const existing = await database
        .get('delivery_items')
        .query()
        .fetchCount();

    if (existing > 0) {
        return;
    }

    await database.write(async () => {
        // USERS
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
        const ITEMS_PER_TRIP = Math.floor(
            TOTAL_ITEMS / TRIP_DEFS.length,
        );

        let globalSeq = 1;
        let itemsWritten = 0;
        let customerToggle = 0;

        for (let ti = 0; ti < TRIP_DEFS.length; ti++) {
            const def = TRIP_DEFS[ti];

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

            const isLast = ti === TRIP_DEFS.length - 1;

            const batchSize = isLast
                ? TOTAL_ITEMS - itemsWritten
                : ITEMS_PER_TRIP;

            for (let i = 0; i < batchSize; i++) {
                const customer =
                    CUSTOMERS[customerToggle % CUSTOMERS.length];
                const location = randomNearbyLocation();

                customerToggle++;

                await database
                    .get<DeliveryItem>('delivery_items')
                    .create((d: any) => {
                        d._raw.id = `DEL-${uid()}`;
                        d.trackingId = `SWR-${String(globalSeq).padStart(5, '0')}`;
                        d.status = itemStatus(def.status);
                        d.sequence = globalSeq++;

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
}