import { Module } from '@nestjs/common'

import {
  IBookingRepository,
  ICarRepository,
  ICarTypeRepository,
  IUserRepository,
} from '../application'
import {
  CarRepository,
  CarTypeRepository,
  UserRepository,
} from '../persistence'
import { BookingRepository } from 'src/persistence/booking.repository'

@Module({
  providers: [
    {
      provide: ICarRepository,
      useClass: CarRepository,
    },
    {
      provide: ICarTypeRepository,
      useClass: CarTypeRepository,
    },
    {
      provide: IUserRepository,
      useClass: UserRepository,
    },
    {
      provide: IBookingRepository,
      useClass: BookingRepository,
    },
  ],
  exports: [ICarRepository, ICarTypeRepository, IUserRepository, IBookingRepository],
})
export class RepositoryModule {}
