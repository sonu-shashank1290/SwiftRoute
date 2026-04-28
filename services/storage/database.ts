import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import { schema } from './schema';
import { DeliveryItem, LocationLog } from './models';

const adapter = new SQLiteAdapter({
    schema,
    dbName: 'swiftroute',
});

export const database = new Database({
    adapter,
    modelClasses: [DeliveryItem, LocationLog],
});
