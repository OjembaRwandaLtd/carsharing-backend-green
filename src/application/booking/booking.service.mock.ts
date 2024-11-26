import { IBookingService } from './booking.service.interface'

export type BookingServiceMock = jest.Mocked<IBookingService>

export function mockBookingService(): BookingServiceMock {
  return {
    create: jest.fn(),
    getAll: jest.fn(),
    get: jest.fn(),
    update: jest.fn(),
    getByRenterId: jest.fn(),
    delete: jest.fn(),
  }
}
