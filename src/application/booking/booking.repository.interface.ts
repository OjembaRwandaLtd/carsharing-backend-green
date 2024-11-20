import { type Except } from 'type-fest'

import { type Transaction } from '../../persistence/database-connection.interface'
// eslint-disable-next-line import/no-cycle
import { CarID } from '../car'

import { type Booking, type BookingID, type BookingProperties } from './booking'

export abstract class IBookingRepository {
  public abstract find(tx: Transaction, id: BookingID): Promise<Booking | null>

  public abstract get(tx: Transaction, id: BookingID): Promise<Booking>

  public abstract getAll(tx: Transaction): Promise<Booking[]>

  public abstract update(tx: Transaction, booking: Booking): Promise<Booking>

  public abstract insert(
    tx: Transaction,
    booking: Except<BookingProperties, 'id'>,
  ): Promise<Booking>

  public abstract getByCarId(
    tx: Transaction,
    id: CarID,
  ): Promise<Booking | null>
}
