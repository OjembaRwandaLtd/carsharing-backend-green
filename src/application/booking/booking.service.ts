import {
  Inject,
  Injectable,
  Logger,
  NotImplementedException,
} from '@nestjs/common'
import { Except } from 'type-fest'

import { IDatabaseConnection } from '../../persistence/database-connection.interface'
import { AccessDeniedError } from '../access-denied.error'
import { ICarRepository } from '../car/car.repository.interface'
import { UserID } from '../user'

import { Booking, BookingProperties, BookingID } from './booking'
import { BookingNotFoundError } from './booking-not-found.error'
import { IBookingRepository } from './booking.repository.interface'

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

  public async update(): Promise<Booking> {
    throw new NotImplementedException('Not implemented.')
  }
}
