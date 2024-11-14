import {
  type DatabaseConnectionMock,
  mockDatabaseConnection,
} from '../../mocks'
//import { UserID } from '../user'
import { UserBuilder } from '../user/user.builder'

import { BookingBuilder } from './booking.builder'
import {
  BookingRepositoryMock,
  mockBookingRepository,
} from './booking.repository.mock'
import { BookingService } from './booking.service'

describe('BookingService', () => {
  let bookingService: BookingService
  let bookingRepositoryMock: BookingRepositoryMock
  let databaseConnectionMock: DatabaseConnectionMock

  beforeEach(() => {
    bookingRepositoryMock = mockBookingRepository()
    databaseConnectionMock = mockDatabaseConnection()

    bookingService = new BookingService(
      bookingRepositoryMock,
      databaseConnectionMock,
    )
  })

  describe('update', () => {
    xit('should update a booking', async () => {
      const owner = new UserBuilder().build()
      const renter = new UserBuilder().build()
      const booking = new BookingBuilder()
        .withOwner(owner)
        .withRenter(renter)
        .build()
      const updatedBooking = BookingBuilder.from(booking)
        .withId(booking.id)
        .withRenter(booking.renterId)
        .build()

      bookingRepositoryMock.get.mockResolvedValue(booking)
      bookingRepositoryMock.update.mockResolvedValue(updatedBooking)

      // await expect(
      //   bookingService.update(booking.id, renter.id, owner.id),
      // ).resolves.toEqual(updatedBooking)
    })

    xit('should be able give all bookings', async () => {
      const bookings = [
        new BookingBuilder().build(),
        new BookingBuilder().build(),
      ]
      bookingRepositoryMock.getAll.mockResolvedValue(bookings)
      await expect(bookingService.getAll()).resolves.toEqual(bookings)
    })

    xit('should be able give a booking', async () => {
      const booking = new BookingBuilder().build()
      bookingRepositoryMock.get.mockResolvedValue(booking)
      await expect(bookingService.get(booking.id)).resolves.toEqual(booking)
    })

    xit('should create a new booking', async () => {
      const booking = new BookingBuilder().build()
      const newBooking = new BookingBuilder().build()
      bookingRepositoryMock.insert.mockResolvedValue(newBooking)
      await expect(bookingService.create(booking)).resolves.toEqual(newBooking)
    })
  })
})
