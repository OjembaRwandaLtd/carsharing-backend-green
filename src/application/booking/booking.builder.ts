import { type Except } from 'type-fest'

import { CarID } from '../car'
import { User, type UserID } from '../user'

import { Booking, BookingID, BookingProperties } from './booking'
import { BookingState } from './booking-state'

type UntaggedBookingProperties = Except<
  BookingProperties,
  'id' | 'carId' | 'renterId'
> & { id: number; carId: number; ownerId: number; renterId: number }

export class BookingBuilder {
  private readonly properties: UntaggedBookingProperties = {
    id: 10 as BookingID,
    carId: 13 as CarID,
    ownerId: 42 as UserID,
    renterId: 42 as UserID,
    state: BookingState.ACCEPTED,
    startDate: new Date('22-11-2024'),
    endDate: new Date('22-11-2024'),
  }

  public static from(
    properties: Booking | Partial<UntaggedBookingProperties>,
  ): BookingBuilder {
    return new BookingBuilder().with(properties)
  }

  public with(properties: Partial<UntaggedBookingProperties>): this {
    let key: keyof UntaggedBookingProperties

    for (key in properties) {
      const value = properties[key]

      if (value !== undefined) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.properties[key] = value
      }
    }

    return this
  }

  public withId(id: number): this {
    this.properties.id = id
    return this
  }

  public withCar(data: number | CarID): this {
    this.properties.carId = data
    return this
  }

  public withOwner(data: number | User): this {
    this.properties.ownerId = typeof data === 'number' ? data : data.id
    return this
  }
  public withRenter(data: number | User): this {
    this.properties.ownerId = typeof data === 'number' ? data : data.id
    return this
  }

  public withState(state: BookingState): this {
    this.properties.state = state
    return this
  }

  public withStartDate(startDate: Date): this {
    this.properties.startDate = startDate
    return this
  }

  public withEndDate(endDate: Date): this {
    this.properties.endDate = endDate
    return this
  }

  public build(): Booking {
    return new Booking({
      ...this.properties,
      id: this.properties.id as BookingID,
      carId: this.properties.carId as CarID,
      renterId: this.properties.renterId as UserID,
    })
  }
}
