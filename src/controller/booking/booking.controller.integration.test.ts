import { HttpStatus, INestApplication } from '@nestjs/common'
import {
  BookingID,
  BookingState,
  CarID,
  IBookingService,
  UserID,
} from '../../application'
import { BookingBuilder } from '../../application/booking/booking.builder'
import { BookingServiceMock } from '../../application/booking/booking.service.mock'
import { UserBuilder } from '../../builders'
import { AuthenticationGuardMock } from '../authentication.guard.mock'
import { mockBookingService } from './booking.service.mock'
import { Test } from '@nestjs/testing'
import { BookingController } from './booking.controller'
import { AuthenticationGuard } from '../authentication.guard'
import { configureGlobalEnhancers } from '../../setup-app'
import request from 'supertest'
import { response } from 'express'

describe('Booking Controller', () => {
  const user = UserBuilder.from({
    id: 42,
    name: 'Nsengi',
  }).build()

  const booking1 = BookingBuilder.from({
    id: 10 as BookingID,
    carId: 13 as CarID,
    ownerId: 42 as UserID,
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
  })
})
