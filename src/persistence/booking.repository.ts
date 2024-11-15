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
  start_date: string
  end_date: string
  car_id: number
  renter_id: number
  state: BookingState
}

function rowToDomain(row: Row): Booking {
  return new Booking({
    id: row.id as BookingID,
    startDate: row.start_date,
    endDate: row.end_date,
    carId: row.car_id as CarID,
    renterId: row.renter_id as UserID,
    state: row.state as BookingState,
  })
}

@Injectable()
export class BookingRepository implements IBookingRepository {
  public find(_tx: Transaction, _id: BookingID): Promise<Booking | null> {
    throw new Error('Not implemented')
  }

  public async get(tx: Transaction, id: BookingID): Promise<Booking> {
    const booking: Row[] = await tx.any(
      `SELECT * FROM bookings WHERE id = ${String(id)}`,
    )
    return booking.map(rowToDomain)[0]
  }

  public async getAll(tx: Transaction): Promise<Booking[]> {
    const bookings: Row[] = await tx.query('SELECT * FROM bookings')
    return bookings.map(rowToDomain)
  }

  public async update(tx: Transaction, booking: Booking): Promise<Booking> {
    const row = await tx.one<Row>(
      `
      UPDATE bookings SET
      car_id = $(carId),
      start_date = $(startDate),
      end_date = $(endDate),
      renter_id = $(renterId),
      owner_id = $(ownerId),
      state = $(state)
      WHERE
      id = $(id)
     RETURNING *`,
      { ...booking },
    )
    return rowToDomain(row)
  }

  public async insert(
    tx: Transaction,
    booking: Except<BookingProperties, 'id'>,
  ): Promise<Booking> {
    const row = await tx.one<Row>(
      `
      INSERT INTO bookings (
        car_id,
        renter_id,
        state, 
        start_date,
        end_date
      ) VALUES (
        $(carId),
        $(renterId),
        $(state),
        $(startDate),
        $(endDate)
      ) RETURNING *`,
      { ...booking },
    )

    return rowToDomain(row)
  }
}
