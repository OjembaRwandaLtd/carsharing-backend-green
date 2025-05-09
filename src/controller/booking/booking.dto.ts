import { ApiProperty, PickType } from '@nestjs/swagger'
import { IsEnum, IsInt, IsPositive, IsDateString } from 'class-validator'
import { type Writable } from 'type-fest'

import {
  Booking,
  type BookingID,
  BookingState,
  CarID,
  type UserID,
} from '../../application'
import { StrictPartialType, validate } from '../../util'

export class BookingDTO {
  @ApiProperty({
    description: 'The id of the booking.',
    type: 'integer',
    minimum: 1,
    example: 10,
    readOnly: true,
  })
  @IsInt()
  @IsPositive()
  public readonly id!: BookingID

  @ApiProperty({
    description: 'The id of the car.',
    type: 'integer',
    minimum: 1,
    example: 13,
    readOnly: true,
  })
  @IsInt()
  @IsPositive()
  public readonly carId!: CarID

  @ApiProperty({
    description: 'The id of the user booked this car.',
    type: 'integer',
    minimum: 1,
    example: 42,
  })
  @IsInt()
  @IsPositive()
  public readonly renterId!: UserID

  @ApiProperty({
    description: 'The current state of the car.',
    enum: BookingState,
    example: BookingState.PENDING,
  })
  @IsEnum(BookingState)
  public readonly state!: BookingState

  @ApiProperty({
    description: 'The start date for booking.',
    type: 'date-time',
    example: '2024-12-12T00:00:00.000Z',
  })
  @IsDateString()
  public readonly startDate!: string

  @ApiProperty({
    description: 'The start date for booking.',
    type: 'date-time',
    example: '2024-12-12T00:00:00.000Z',
  })
  @IsDateString()
  public readonly endDate!: string

  public static create(data: {
    id: BookingID
    startDate: Date
    endDate: Date
    carId: CarID
    renterId: UserID
    state: BookingState
  }): BookingDTO {
    const instance = new BookingDTO() as Writable<BookingDTO>

    instance.id = data.id
    instance.startDate = data.startDate.toISOString()
    instance.endDate = data.endDate.toISOString()
    instance.carId = data.carId
    instance.renterId = data.renterId
    instance.state = data.state

    return validate(instance)
  }

  public static fromModel(booking: Booking): BookingDTO {
    return BookingDTO.create(booking)
  }
}
export class CreateBookingDTO extends PickType(BookingDTO, [
  'carId',
  'startDate',
  'endDate',
] as const) {}

export class PatchBookingDTO extends StrictPartialType(
  PickType(BookingDTO, [
    'id',
    'renterId',
    'startDate',
    'endDate',
    'state',
  ] as const),
) {}
