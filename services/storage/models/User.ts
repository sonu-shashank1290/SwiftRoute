import { Model } from "@nozbe/watermelondb";
import { date, field, readonly } from "@nozbe/watermelondb/decorators";

export class User extends Model {
    static table = 'users';

    @field('name') name!: string;
    @field('email') email!: string;
    @field('role') role!: string;
    @readonly @date('created_at') createdAt!: Date;
}