import { INestApplication } from '@nestjs/common'
import {
  BookingID,
  BookingState,
  CarID,
  IBookingService,
  UserID,
} from 'src/application'
import { BookingBuilder } from 'src/application/booking/booking.builder'
import { BookingServiceMock } from 'src/application/booking/booking.service.mock'
import { UserBuilder } from 'src/builders'
import { AuthenticationGuardMock } from '../authentication.guard.mock'
import { mockBookingService } from './booking.service.mock'
import { Test } from '@nestjs/testing'
import { BookingController } from './booking.controller'
import { AuthenticationGuard } from '../authentication.guard'
import { configureGlobalEnhancers } from 'src/setup-app'

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
    state: BookingState.ACCEPTED,
    startDate: new Date('22-11-2024'),
    endDate: new Date('23-11-2024'),
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
})
