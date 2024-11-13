import { Injectable } from '@nestjs/common'
import { type Except } from 'type-fest'

import {
  type BookingID,
  type BookingProperties,
  type BookingState,
  type IBookingRepository,
  type UserID,
  type CarID,
} from '../application'
import { Booking } from '../application/booking'

import { type Transaction } from './database-connection.interface'

type Row = {
  id: number
  start_date: Date
  end_date: Date
  car_id: number
  renter_id: number
  owner_id: number
  state: string
}

function rowToDomain(row: Row): Booking {
  return new Booking({
    id: row.id as BookingID,
    startDate: row.start_date,
    endDate: row.end_date,
    carId: row.car_id as CarID,
    renterId: row.renter_id as UserID,
    ownerId: row.owner_id as UserID,
    state: row.state as BookingState,
  })
}

@Injectable()
export class BookingRepository implements IBookingRepository {
  public find(tx: Transaction, id: BookingID): Promise<Booking | null> {
    throw new Error('Not implemented')
  }

  public async get(tx: Transaction, id: BookingID): Promise<Booking> {
    const booking: Row[] = await tx.any(
      `SELECT * FROM bookings WHERE id = ${String(id)}`,
    )
    return booking.map(rowToDomain)[0]
  }

  public async getAll(tx: Transaction): Promise<Booking[]> {
    //const rows = await tx.any<Row>('SELECT * FROM car_types')
    const bookings: Row[] = await tx.query('SELECT * FROM bookings')
    return bookings.map(rowToDomain)
  }

  public async update(
    tx: Transaction,
    booking: Booking,
  ): Promise<Booking | null> {
    throw new Error('Not implemented')
  }

  public async insert(
    tx: Transaction,
    booking: Except<BookingProperties, 'id'>,
  ): Promise<Booking> {
    throw new Error('Not implemented')
  }
}
