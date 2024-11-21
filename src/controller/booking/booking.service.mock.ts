import { IBookingService } from 'src/application'

export type BookingServiceMock = jest.Mocked<IBookingService>

export function bookingServiceMock(): BookingServiceMock {
  return {
    create: jest.fn(),
    getAll: jest.fn(),
    get: jest.fn(),
    update: jest.fn(),
    getByCarId: jest.fn(),
    getByRenterId: jest.fn(),
  }
}
