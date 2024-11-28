import { Module } from '@nestjs/common'

import { BookingRepository } from 'src/persistence/booking.repository'

import {
  AuthenticationService,
  BookingService,
  CarService,
  CarTypeService,
  IAuthenticationService,
  IBookingRepository,
  IBookingService,
  ICarService,
  ICarTypeService,
  IUserService,
  UserService,
} from '../application'

import { DatabaseModule } from './database.module'
import { RepositoryModule } from './repository.module'

@Module({
  imports: [DatabaseModule, RepositoryModule],
  providers: [
    {
      provide: IAuthenticationService,
      useClass: AuthenticationService,
    },
    {
      provide: ICarService,
      useClass: CarService,
    },
    {
      provide: ICarTypeService,
      useClass: CarTypeService,
    },
    {
      provide: IUserService,
      useClass: UserService,
    },
    {
      provide: IBookingService,
      useClass: BookingService,
    },
    {
      provide: IBookingRepository,
      useClass: BookingRepository,
    },
  ],
  exports: [
    IAuthenticationService,
    ICarService,
    ICarTypeService,
    IUserService,
    IBookingService,
    IBookingRepository,
  ],
})
export class ServiceModule {}
