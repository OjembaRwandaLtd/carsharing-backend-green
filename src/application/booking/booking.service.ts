import { Injectable, Logger, NotImplementedException } from '@nestjs/common'

import { IDatabaseConnection } from '../../persistence/database-connection.interface'

import { Booking, BookingID, BookingProperties } from './booking'
import { BookingNotFoundError } from './booking-not-found.error'
import { IBookingRepository } from './booking.repository.interface'
import { BookingDTO } from 'src/controller/booking'
import { NotOwnerError } from '../not-owner.error'
import { BookingState } from './booking-state'
import { Except } from 'type-fest'
import { UserID } from '../user'

@Injectable()
export class BookingService {
  private readonly bookingRepository: IBookingRepository
  private readonly databaseConnection: IDatabaseConnection
  private readonly logger: Logger

  public constructor(
    bookingRepository: IBookingRepository,
    databaseConnection: IDatabaseConnection,
  ) {
    this.bookingRepository = bookingRepository
    this.databaseConnection = databaseConnection
    this.logger = new Logger(BookingService.name)
  }

  public async create(data: Except<BookingProperties, 'id'>): Promise<Booking> {
    this.logger.verbose('Creating new booking')
    return this.databaseConnection.transactional(async tx => {
      return await this.bookingRepository.insert(tx, data)
    })
  }

  public async getAll(): Promise<Booking[]> {
    this.logger.verbose('Loading all bookings')

    return this.databaseConnection.transactional(async tx => {
      return await this.bookingRepository.getAll(tx)
    })
  }

  public async get(id: BookingID): Promise<Booking> {
    return this.databaseConnection.transactional(async tx => {
      const booking = await this.bookingRepository.get(tx, id)
      if (!booking) throw new BookingNotFoundError(id)
      return booking
    })
  }

  public async update(
    bookingId: BookingID,
    updates: Partial<Except<BookingProperties, 'id'>>,
    currentUserId: UserID,
  ): Promise<Booking> {
    this.logger.verbose(`Updating booking ${bookingId}`)
    return this.databaseConnection.transactional(async tx => {
      const booking = await this.bookingRepository.get(tx, bookingId)
      if (!booking) throw new BookingNotFoundError(bookingId)

      const validBooking: Booking = booking

      if (
        validBooking.state === BookingState.PENDING &&
        validBooking.ownerId === currentUserId
      ) {
        const updatedBooking = new Booking({
          ...validBooking,
          ...updates,
          id: bookingId,
        })

        return await this.bookingRepository.update(tx, updatedBooking)
      }
      throw new NotOwnerError('Booking', 'UPDATE')
    })
  }
}
