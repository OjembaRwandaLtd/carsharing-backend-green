import { IsInt, IsPositive, IsEnum, IsDateString } from 'class-validator'
import { type Opaque } from 'type-fest'

import { validate } from '../../util'
import { type CarID } from '../car'
import { type UserID } from '../user'

import { BookingState } from './booking-state'

export type BookingID = Opaque<number, 'booking-id'>

export type BookingProperties = {
  id: BookingID
  startDate: string
  endDate: string
  carId: CarID
  renterId: UserID
  state: BookingState
}

export class Booking {
  @IsInt()
  @IsPositive()
  public readonly id: BookingID

  @IsDateString()
  public readonly startDate: string

  @IsDateString()
  public readonly endDate: string

  @IsInt()
  @IsPositive()
  public readonly carId: CarID

  @IsInt()
  @IsPositive()
  public readonly renterId: UserID

  @IsEnum(BookingState)
  public readonly state: BookingState

  public constructor(data: BookingProperties) {
    this.id = data.id
    this.startDate = data.startDate
    this.endDate = data.endDate
    this.carId = data.carId
    this.renterId = data.renterId
    this.state = data.state

    validate(this)
  }
}
