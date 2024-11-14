import { IBookingRepository } from './booking.repository.interface'

export type BookingRepositoryMock = jest.Mocked<IBookingRepository>

export function mockBookingRepository(): BookingRepositoryMock {
  return {
    find: jest.fn(),
    get: jest.fn(),
    getAll: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
  }
}
