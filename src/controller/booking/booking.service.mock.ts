import { IBookingService } from 'src/application'

export type BookingServiceMock = jest.Mocked<IBookingService>

export function mockBookingService(): BookingServiceMock {
  return {
    create: jest.fn(),
    getAll: jest.fn(),
    get: jest.fn(),
    update: jest.fn(),
    getByRenterId: jest.fn(),
  }
}
