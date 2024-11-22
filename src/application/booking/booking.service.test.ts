import {
  type DatabaseConnectionMock,
  mockDatabaseConnection,
} from '../../mocks'
import { UserID } from '../user'

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

  beforeEach(() => {
    bookingRepositoryMock = mockBookingRepository()
    databaseConnectionMock = mockDatabaseConnection()

    bookingService = new BookingService(
      bookingRepositoryMock,
      databaseConnectionMock,
    )
  })

  describe('update', () => {
    it('should update a booking', async () => {
      const booking = new BookingBuilder()
        .withState(BookingState.PENDING)
        .build()

      bookingRepositoryMock.get.mockResolvedValue(booking)
      bookingRepositoryMock.update.mockResolvedValue({
        ...booking,
        state: BookingState.ACCEPTED,
      })
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
    it('should return a booking if it exists and user has access', async () => {
      const userId = 1 as UserID
      const booking = new BookingBuilder()
        .withId(1)
        .withRenterId(userId)
        .build()
      bookingRepositoryMock.get.mockResolvedValue(booking)

      const result = await bookingService.get(booking.id)
      expect(result).toEqual(booking)
    })

    it('should throw BookingNotFoundError when the booking does not exist', async () => {
      const bookingId = 999 as BookingID

      bookingRepositoryMock.get.mockResolvedValue(null)

      await expect(bookingService.get(bookingId)).rejects.toThrow(
        BookingNotFoundError,
      )
    })
  })
})
