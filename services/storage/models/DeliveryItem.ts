import { Model } from '@nozbe/watermelondb';
import { field, readonly, date } from '@nozbe/watermelondb/decorators';

export class DeliveryItem extends Model {
    static table = 'delivery_items';

    @field('tracking_id') trackingId!: string;
    @field('recipient') recipient!: string;
    @field('address') address!: string;
    @field('status') status!: 'pending' | 'delivered' | 'failed';
    @field('latitude') latitude!: number;
    @field('longitude') longitude!: number;
    @field('sequence') sequence?: number;
    @field('trip_id') tripId?: string;
    @field('user_id') userId!: string;
    @field('driver_id') driverId?: string;
    @readonly @date('created_at') createdAt!: string;
}