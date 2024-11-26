import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { Except } from 'type-fest'

import { IDatabaseConnection } from '../../persistence/database-connection.interface'
import { CarID } from '../car/car'

import { Booking, BookingID, BookingProperties } from './booking'
import { BookingNotFoundError } from './booking-not-found.error'
import { BookingState } from './booking-state'
import { validTransitions } from './booking-state-transitions'
import { IBookingRepository } from './booking.repository.interface'
import { InvalidBookingStateTransitionError } from './errors/invalid-booking-state-transition.error'
import { ICarRepository } from '../car'
import { UserID } from '../user'
import { AccessDeniedError } from '../access-denied.error'

@Injectable()
export class BookingService {
  private readonly bookingRepository: IBookingRepository
  private readonly databaseConnection: IDatabaseConnection
  private readonly carRepository: ICarRepository
  private readonly logger: Logger
  private validateStateTransition(
    currentState: BookingState,
    newState: BookingState,
  ): boolean {
    const allowedTransitions = validTransitions[currentState]
    return allowedTransitions.includes(newState)
  }

  public constructor(
    bookingRepository: IBookingRepository,
    databaseConnection: IDatabaseConnection,
    carRepository: ICarRepository,
  ) {
    this.bookingRepository = bookingRepository
    this.databaseConnection = databaseConnection
    this.carRepository = carRepository
    this.logger = new Logger(BookingService.name)
  }
  public async findCarId(carId: CarID): Promise<Booking[]> {
    const existingBookings = await this.getAll()
    const availableBookings = existingBookings.filter(
      booking => booking.carId === carId,
    )
    return availableBookings
  }

  public async isCarAvailable(
    carId: CarID,
    startDate: Date,
    endDate: Date,
  ): Promise<boolean> {
    const bookings = await this.findCarId(carId)
    for (const booking of bookings) {
      if (
        (startDate >= booking.startDate && startDate <= booking.endDate) ||
        (endDate >= booking.startDate && endDate <= booking.endDate)
      ) {
        return false
      }
    }
    return true
  }

  public async create(data: Except<BookingProperties, 'id'>): Promise<Booking> {
    this.logger.verbose('Creating new booking')
    return this.databaseConnection.transactional(async tx => {
      if (
        !(await this.isCarAvailable(data.carId, data.startDate, data.endDate))
      ) {
        throw new BadRequestException('Car is not available')
      }
      return await this.bookingRepository.insert(tx, data)
    })
  }

  public async getAll(): Promise<Booking[]> {
    return this.databaseConnection.transactional(async tx => {
      return await this.bookingRepository.getAll(tx)
    })
  }

  public async get(id: BookingID, currentUserId: UserID): Promise<Booking> {
    return this.databaseConnection.transactional(async tx => {
      const booking = await this.bookingRepository.get(tx, id)

      if (!booking) throw new BookingNotFoundError(id)
      const car = await this.carRepository.get(tx, booking.carId)
      if (currentUserId !== booking.renterId && currentUserId !== car.ownerId)
        throw new AccessDeniedError('get booking', booking.id)
      return booking
    })
  }

  public async update(
    bookingId: BookingID,
    updates: Partial<Except<BookingProperties, 'id'>>,
  ): Promise<Booking> {
    return this.databaseConnection.transactional(async tx => {
      const booking = await this.bookingRepository.find(tx, bookingId)
      if (!booking) throw new BookingNotFoundError(bookingId)
      const updatedBooking = new Booking({
        ...booking,
        ...updates,
        id: bookingId,
      })
      return await this.bookingRepository.update(tx, updatedBooking)
    })
  }
}
