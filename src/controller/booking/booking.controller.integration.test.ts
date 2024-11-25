import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import request from 'supertest'

import {
  BookingID,
  BookingNotFoundError,
  BookingState,
  CarID,
  IBookingService,
  UserID,
} from '../../application'
import { BookingBuilder } from '../../application/booking/booking.builder'
import { BookingServiceMock } from '../../application/booking/booking.service.mock'
import { UserBuilder } from '../../builders'
import { configureGlobalEnhancers } from '../../setup-app'
import { AuthenticationGuard } from '../authentication.guard'
import { AuthenticationGuardMock } from '../authentication.guard.mock'

import { BookingController } from './booking.controller'
import { mockBookingService } from './booking.service.mock'

describe('Booking Controller', () => {
  const user = UserBuilder.from({
    id: 42,
    name: 'Nsengi',
  }).build()

  const booking1 = BookingBuilder.from({
    id: 10 as BookingID,
    carId: 13 as CarID,
    renterId: 42 as UserID,
    state: BookingState.PENDING,
    startDate: new Date('2024-11-22'),
    endDate: new Date('2024-11-23'),
  }).build()

  let app: INestApplication
  let bookingServiceMock: BookingServiceMock
  let authenticationGuardMock: AuthenticationGuardMock

  beforeEach(async () => {
    bookingServiceMock = mockBookingService()
    authenticationGuardMock = new AuthenticationGuardMock(user)

    const moduleReference = await Test.createTestingModule({
      imports: [],
      controllers: [BookingController],
      providers: [
        {
          provide: IBookingService,
          useValue: bookingServiceMock,
        },
      ],
    })
      .overrideGuard(AuthenticationGuard)
      .useValue(authenticationGuardMock)
      .compile()

    app = moduleReference.createNestApplication()
    await configureGlobalEnhancers(app).init()
  })
  afterEach(() => app.close())

  describe('getall', () => {
    it('should return all bookings', async () => {
      bookingServiceMock.getAll.mockResolvedValue([booking1])

      await request(app.getHttpServer())
        .get('/bookings')
        .expect(HttpStatus.OK)
        .expect(response => {
          expect(response.body).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                id: 10,
                carId: 13,
                renterId: 42,
                state: BookingState.PENDING,
                startDate: '2024-11-22T00:00:00.000Z',
                endDate: '2024-11-23T00:00:00.000Z',
              }),
            ]),
          )
        })
    })
  })

  describe('get', () => {
    it('should return one booking', async () => {
      bookingServiceMock.get.mockResolvedValue(booking1)

      await request(app.getHttpServer())
        .get(`/bookings/${booking1.id}`)
        .expect(HttpStatus.OK)
        .expect(response => {
          expect(response.body).toEqual(
            expect.objectContaining({
              id: 10,
              carId: 13,
              renterId: 42,
              state: BookingState.PENDING,
              startDate: '2024-11-22T00:00:00.000Z',
              endDate: '2024-11-23T00:00:00.000Z',
            }),
          )
        })
    })
    it('should return a 400 for invalid id', async () => {
      await request(app.getHttpServer())
        .get('/bookings/invalid')
        .expect(HttpStatus.BAD_REQUEST)
    })
  })

  describe('create', () => {
    it('should create a new booking', async () => {
      const newBooking = {
        startDate: new Date(Date.now() + 100),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        carId: 13 as CarID,
      }

      const createdBooking = {
        ...newBooking,
        id: 100 as BookingID,
        renterId: user.id,
        state: BookingState.PENDING,
      }

      bookingServiceMock.create.mockResolvedValue(createdBooking)

      await request(app.getHttpServer())
        .post('/bookings')
        .send(newBooking)
        .expect(response => {
          expect(response.body).toEqual(
            expect.objectContaining({
              ...createdBooking,
              startDate: new Date(Date.now() + 100).toISOString(),
              endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            }),
          )
        })
        .expect(HttpStatus.CREATED)
    })

    it('should return 400 for invalid date range', async () => {
      const invalidBooking = {
        startDate: new Date('2024-11-23T00:00:00.000Z'),
        endDate: new Date('2024-11-22T00:00:00.000Z'),
        carId: 13 as CarID,
      }

      await request(app.getHttpServer())
        .post('/bookings')
        .send(invalidBooking)
        .expect(HttpStatus.BAD_REQUEST)
        .expect(response => {
          expect(response.body.message).toBe(
            'End date must come after start date',
          )
        })
    })

    it('should return 400 for missing start date', async () => {
      const invalidBooking = {
        endDate: '2024-11-23T00:00:00.000Z',
      }

      await request(app.getHttpServer())
        .post('/bookings')
        .send(invalidBooking)
        .expect(HttpStatus.BAD_REQUEST)
    })

    it('should return 400 for car id not found error', async () => {
      const newBooking = {
        startDate: new Date('2024-11-23T00:00:00.000Z'),
        endDate: new Date('2024-11-22T00:00:00.000Z'),
      }

      bookingServiceMock.create.mockRejectedValue(
        new BookingNotFoundError(100 as BookingID),
      )

      await request(app.getHttpServer())
        .post('/bookings')
        .send(newBooking)
        .expect(HttpStatus.BAD_REQUEST)
        .expect(response => {
          expect(response.body.message).toStrictEqual(
            expect.arrayContaining([
              'carId must be a positive number',
              'carId must be an integer number',
            ]),
          )
        })
    })

    it('should return 400 for invalid start date', async () => {
      const invalidBooking = {
        startDate: new Date('2024-11-22T00:00:00.000Z'),
        endDate: new Date('2024-11-21T00:00:00.000Z'),
        carId: 13 as CarID,
      }

      await request(app.getHttpServer())
        .post('/bookings')
        .send(invalidBooking)
        .expect(HttpStatus.BAD_REQUEST)
        .expect(response => {
          expect(response.body.message).toBe(
            'End date must come after start date',
          )
        })
    })

    it('should return 400 for missing end date', async () => {
      const invalidBooking = {
        startDate: new Date('2024-11-22T00:00:00.000Z'),
        carId: 13 as CarID,
      }

      await request(app.getHttpServer())
        .post('/bookings')
        .send(invalidBooking)
        .expect(HttpStatus.BAD_REQUEST)
    })

    it('should return 400 for start date in the past', async () => {
      const invalidBooking = {
        startDate: new Date(Date.now() - 10_000).toISOString(), // 10 seconds in the past
        endDate: new Date('2024-11-23T00:00:00.000Z').toISOString(),
        carId: 13 as CarID,
      }

      await request(app.getHttpServer())
        .post('/bookings')
        .send(invalidBooking)
        .expect(HttpStatus.BAD_REQUEST)
        .expect(response => {
          expect(response.body.message).toBe(
            'End date must come after start date',
          )
        })
    })

    it('should return 400 for end date not after start date', async () => {
      const invalidBooking = {
        startDate: new Date('2024-11-23T00:00:00.000Z').toISOString(),
        endDate: new Date('2024-11-22T00:00:00.000Z').toISOString(),
        carId: 13 as CarID,
      }

      await request(app.getHttpServer())
        .post('/bookings')
        .send(invalidBooking)
        .expect(HttpStatus.BAD_REQUEST)
        .expect(response => {
          expect(response.body.message).toBe(
            'End date must come after start date',
          )
        })
    })
  })

  describe('patch', () => {
    it('should update a booking', async () => {
      const updates = {
        startDate: new Date('2024-11-23T16:09:51.389Z').toISOString(),
        endDate: new Date('2024-11-22T16:09:51.389Z').toISOString(),
        state: BookingState.ACCEPTED,
      }

      const updatedBooking = {
        ...booking1,
        ...updates,
        startDate: new Date('2024-11-22T16:09:51.389Z'),
        endDate: new Date('2024-11-23T16:09:51.389Z'),
      }

      bookingServiceMock.update.mockResolvedValue(updatedBooking)

      await request(app.getHttpServer())
        .patch(`/bookings/${booking1.id}`)
        .send(updates)
        .expect(HttpStatus.OK)
        .expect(response => {
          expect(response.body).toEqual(
            expect.objectContaining({
              ...updatedBooking,
              startDate: new Date('2024-11-22T16:09:51.389Z').toISOString(),
              endDate: new Date('2024-11-23T16:09:51.389Z').toISOString(),
            }),
          )
        })
    })

    it('should return 400 for invalid booking id', async () => {
      await request(app.getHttpServer())
        .patch('/bookings/invalid')
        .send({ state: BookingState.ACCEPTED })
        .expect(HttpStatus.BAD_REQUEST)
    })

    it('should return 404 for non-existent booking during update', async () => {
      const updates = {
        state: BookingState.DECLINED,
      }

      bookingServiceMock.update.mockRejectedValue(
        new Error('Booking not found'),
      )

      await request(app.getHttpServer())
        .patch(`/bookings/non-existing`)
        .send(updates)
        .expect(HttpStatus.BAD_REQUEST)
    })

    it('should return 400 for invalid update data', async () => {
      const updates = {
        endDate: 'invalid date',
      }

      await request(app.getHttpServer())
        .patch(`/bookings/${booking1.id}`)
        .send(updates)
        .expect(HttpStatus.BAD_REQUEST)
    })

    it('should return 400 for invalid booking state transition', async () => {
      const updates = {
        state: 'INVALID_STATE',
      }

      await request(app.getHttpServer())
        .patch(`/bookings/${booking1.id}`)
        .send(updates)
        .expect(HttpStatus.BAD_REQUEST)
        .expect(response => {
          expect(response.body.message).toStrictEqual(
            expect.arrayContaining([
              'state must be one of the following values: ACCEPTED, PICKED_UP, RETURNED, DECLINED, PENDING',
            ]),
          )
        })
    })

    it('should return 404 for non-existent booking during update', async () => {
      const updates = {
        state: BookingState.DECLINED,
      }

      bookingServiceMock.update.mockRejectedValue(
        new BookingNotFoundError(999 as BookingID),
      )

      await request(app.getHttpServer())
        .patch(`/bookings/999`)
        .send(updates)
        .expect(HttpStatus.NOT_FOUND)
        .expect(response => {
          expect(response.body.message).toBe('Booking not found')
        })
    })
  })
})
