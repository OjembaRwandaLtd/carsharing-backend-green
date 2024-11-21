import { type Except } from 'type-fest'

import { type CarID } from '../car'
import { type UserID } from '../user'

import { type Booking, type BookingID, type BookingProperties } from './booking'

export abstract class IBookingService {
  public abstract update(
    bookingId: BookingID,
    updates: Partial<Except<BookingProperties, 'id'>>,
    currentUserId: UserID,
  ): Promise<Booking>

  public abstract create(
    properties: Except<BookingProperties, 'id'>,
  ): Promise<Booking>

  public abstract getAll(): Promise<Booking[]>

  public abstract get(id: BookingID): Promise<Booking>

  public abstract getByRenterId(renterId: UserID): Promise<Booking[]>
}
