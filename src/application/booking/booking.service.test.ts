import {
  CarServiceMock,
  type DatabaseConnectionMock,
  mockCarService,
  mockDatabaseConnection,
} from '../../mocks'
import { AccessDeniedError } from '../access-denied.error'
import { CarBuilder } from '../car/car.builder'
import { UserID } from '../user'
//import { UserID } from '../user'
import { UserBuilder } from '../user/user.builder'

import { BookingID } from './booking'
import { BookingNotFoundError } from './booking-not-found.error'
import { BookingState } from './booking-state'
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
  let carServiceMock: CarServiceMock

  beforeEach(() => {
    bookingRepositoryMock = mockBookingRepository()
    databaseConnectionMock = mockDatabaseConnection()
    carServiceMock = mockCarService()

    bookingService = new BookingService(
      bookingRepositoryMock,
      carServiceMock,
      databaseConnectionMock,
    )
  })

  describe('update', () => {
    it('should update a booking', async () => {
      const booking = new BookingBuilder()
        .withState(BookingState.PENDING)
        .build()

      const user = new UserBuilder().build()
      const car = new CarBuilder().withOwner(user).build()

      bookingRepositoryMock.get.mockResolvedValue(booking)
      bookingRepositoryMock.update.mockResolvedValue({
        ...booking,
        state: BookingState.ACCEPTED,
      })
      carServiceMock.get.mockResolvedValue(car)
      const updates = { state: BookingState.ACCEPTED }
      await expect(bookingService.update(booking.id, updates)).resolves.toEqual(
        {
          ...booking,
          state: BookingState.ACCEPTED,
        },
      )
    })
  })
  describe('getAll', () => {
    it('should be able give all bookings', async () => {
      const bookings = [
        new BookingBuilder().withId(1).build(),
        new BookingBuilder().withId(2).build(),
      ]
      bookingRepositoryMock.getAll.mockResolvedValue(bookings)
      await expect(bookingService.getAll()).resolves.toEqual(bookings)
    })
    it('should return an empty array if there are no bookings', async () => {
      bookingRepositoryMock.getAll.mockResolvedValue([])
      await expect(bookingService.getAll()).resolves.toEqual([])
    })
  })
  describe('get', () => {
    it('should throw AccessDeniedError if user is not owner or renter', async () => {
      // const userId = 1 as UserID
      const renterId = 2 as UserID
      const booking = new BookingBuilder()
        .withId(1)
        .withRenterId(renterId)
        .build()
      const car = new CarBuilder().withId(booking.carId).withOwner(3).build()

      bookingRepositoryMock.get.mockResolvedValue(booking)
      carServiceMock.get.mockResolvedValue(car)

      await expect(bookingService.get(booking.id)).rejects.toThrow(
        AccessDeniedError,
      )
    })

    it('should return a booking if it exists and user has access', async () => {
      const userId = 1 as UserID
      const booking = new BookingBuilder()
        .withId(1)
        .withRenterId(userId)
        .build()
      const car = new CarBuilder()
        .withId(booking.carId)
        .withOwner(userId)
        .build()
      bookingRepositoryMock.get.mockResolvedValue(booking)
      carServiceMock.get.mockResolvedValue(car)

      const result = await bookingService.get(booking.id)
      expect(result).toEqual(booking)
    })

    it('should throw BookingNotFoundError when the booking does not exist', async () => {
      // const currentUserId = 1 as UserID
      const bookingId = 999 as BookingID

      bookingRepositoryMock.get.mockResolvedValue(null)

      await expect(bookingService.get(bookingId)).rejects.toThrow(
        BookingNotFoundError,
      )
    })
  })

  // xit('should be able give a booking', async () => {
  //   const booking = new BookingBuilder().build()
  //   bookingRepositoryMock.get.mockResolvedValue(booking)
  //   await expect(bookingService.get(booking.id)).resolves.toEqual(booking)
  // })

  // xit('should create a new booking', async () => {
  //   const booking = new BookingBuilder().build()
  //   const newBooking = new BookingBuilder().build()
  //   bookingRepositoryMock.insert.mockResolvedValue(newBooking)
  //   await expect(bookingService.create(booking)).resolves.toEqual(newBooking)
  // })
})
