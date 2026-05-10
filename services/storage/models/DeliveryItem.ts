import { Model, Relation } from '@nozbe/watermelondb';
import { field, readonly, date, relation } from '@nozbe/watermelondb/decorators';
import { User } from './User';

export class DeliveryItem extends Model {
    static table = 'delivery_items';

    @field('tracking_id') trackingId!: string;
    @field('status') status!: 'pending' | 'delivered' | 'failed';
    @field('sequence') sequence!: number;
    @field('trip_id') tripId!: string;
    @field('user_id') userId!: string;
    @field('address') address!: string;
    @field('latitude') latitude!: number;
    @field('longitude') longitude!: number;
    @field('driver_id') driverId?: string;
    @readonly @date('created_at') createdAt!: Date;
}