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
import { Booking, BookingNotFoundError } from '../application/booking'

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
    startDate: new Date(row.start_date),
    endDate: new Date(row.end_date),
    carId: row.car_id as CarID,
    renterId: row.renter_id as UserID,
    state: row.state,
  })
}

@Injectable()
export class BookingRepository implements IBookingRepository {
  public async get(tx: Transaction, id: BookingID): Promise<Booking | null> {
    const booking: Row[] = await tx.any(
      `SELECT * FROM bookings WHERE id = ${String(id)}`,
    )
    return booking ? booking.map(rowToDomain)[0] : null
  }

  public async getAll(tx: Transaction): Promise<Booking[]> {
    const bookings: Row[] = await tx.query('SELECT * FROM bookings')
    return bookings.map(rowToDomain)
  }

  public async update(tx: Transaction, booking: Booking): Promise<Booking> {
    console.log(booking.state)

    const row = await tx.one<Row>(
      `
      UPDATE bookings SET
      car_id = $(carId),
      start_date = $(startDate),
      end_date = $(endDate),
      renter_id = $(renterId),
      state = $(state)
      WHERE
      id = $(id)
     RETURNING *`,
      {
        id: booking.id,
        startDate: booking.startDate,
        endDate: booking.endDate,
        carId: booking.carId,
        state: booking.state,
        renterId: booking.renterId,
      },
    )
    if (!row) {
      throw new BookingNotFoundError(booking.id)
    }

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

  public async getByCarId(
    tx: Transaction,
    carId: CarID,
  ): Promise<Booking | null> {
    const row = await tx.oneOrNone<Row>(
      "SELECT * FROM bookings WHERE car_id = $(carId) AND state = 'PICKED_UP' LIMIT 1",
      {
        carId,
      },
    )
    return row ? rowToDomain(row) : null
  }

  public async deleteById(
    tx: Transaction,
    bookingId: BookingID,
  ): Promise<Booking | null> {
    const row = await tx.oneOrNone<Row>(
      'DELETE FROM bookings WHERE id = $(booingId)',
      {
        bookingId,
      },
    )
    return row ? rowToDomain(row) : null
  }
}
