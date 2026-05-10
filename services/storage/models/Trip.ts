import { Model } from '@nozbe/watermelondb';
import { field, readonly, date } from '@nozbe/watermelondb/decorators';

export class Trip extends Model {
    static table = 'trips';

    @field('driver_id') driverId!: string;
    @field('status') status!: 'active' | 'completed' | 'cancelled';
    @field('started_at') startedAt!: number;
    @field('ended_at') endedAt?: number;
    @field('is_off_route') isOffRoute!: boolean;
}