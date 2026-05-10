import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import { schema } from './schema';
import { DeliveryItem, LocationLog, User, Trip } from './models';

const adapter = new SQLiteAdapter({
    schema,
    dbName: 'swiftroute',
    jsi: true,
});

export const database = new Database({
    adapter,
    modelClasses: [DeliveryItem, LocationLog, User, Trip],
});
