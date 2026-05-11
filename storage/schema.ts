import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
    version: 1,
    tables: [
        tableSchema({
            name: 'users',
            columns: [
                { name: 'name', type: 'string' },
                { name: 'email', type: 'string' },
                { name: 'address', type: 'string', isOptional: true },
                { name: 'latitude', type: 'number', isOptional: true },
                { name: 'longitude', type: 'number', isOptional: true },
                { name: 'role', type: 'string' },
                { name: 'created_at', type: 'number' },
            ],
        }),
        tableSchema({
            name: 'delivery_items',
            columns: [
                { name: 'tracking_id', type: 'string' },
                { name: 'status', type: 'string' },
                { name: 'sequence', type: 'number' },
                { name: 'trip_id', type: 'string' },
                { name: 'user_id', type: 'string' },
                { name: 'address', type: 'string' },
                { name: 'latitude', type: 'number' },
                { name: 'longitude', type: 'number' },
                { name: 'driver_id', type: 'string' },
                { name: 'created_at', type: 'number' },
            ],
        }),
        tableSchema({
            name: 'trips',
            columns: [
                { name: 'driver_id', type: 'string' },
                { name: 'status', type: 'string' },
                { name: 'started_at', type: 'number' },
                { name: 'ended_at', type: 'number', isOptional: true },
                { name: 'is_off_route', type: 'boolean' },
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