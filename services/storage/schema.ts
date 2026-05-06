import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
    version: 1,
    tables: [
        tableSchema({
            name: 'users',
            columns: [
                { name: 'name', type: 'string' },
                { name: 'email', type: 'string' },
                { name: 'role', type: 'string' },
                { name: 'created_at', type: 'number' },
            ],
        }),
        tableSchema({
            name: 'delivery_items',
            columns: [
                { name: 'tracking_id', type: 'string' },
                { name: 'recipient', type: 'string' },
                { name: 'address', type: 'string' },
                { name: 'status', type: 'string' },
                { name: 'latitude', type: 'number' },
                { name: 'longitude', type: 'number' },
                { name: 'sequence', type: 'number', isOptional: true },
                { name: 'trip_id', type: 'string', isOptional: true },
                { name: 'user_id', type: 'string' },
                { name: 'driver_id', type: 'string' },
                { name: 'created_at', type: 'number' },
            ],
        }),
        tableSchema({
            name: 'location_logs',
            columns: [
                { name: 'latitude', type: 'number' },
                { name: 'longitude', type: 'number' },
                { name: 'timestamp', type: 'number' },
                { name: 'trip_id', type: 'string' },
            ],
        }),
    ]
});