import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';

export class LocationLog extends Model {
  static table = 'location_logs';

  @field('latitude') latitude!: number;
  @field('longitude') longitude!: number;
  @date('timestamp') timestamp!: string;
  @field('trip_id') tripId!: string;
}