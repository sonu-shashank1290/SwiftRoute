import { database } from './database';
import { User } from './models/User';
import { MOCK_USERS } from '@/constants/mockUsers';

export async function seedUsers() {
    const userCollection = database.get<User>('users');
    const count = await userCollection.query().fetchCount();
    if (count > 0) return;

    await database.write(async () => {
        const batch = MOCK_USERS.map(user =>
            userCollection.prepareCreate(record => {
                record._raw.id = user.id;
                record.name = user.name;
                record.email = user.email;
                record.role = user.role;
            })
        );
        await database.batch(...batch);
    });

}