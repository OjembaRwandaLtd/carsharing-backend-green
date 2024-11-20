import { setupIntegrationTest } from '../../jest.integration-test-setup'

import { BookingRepository } from './booking.repository'

describe('BookingRepository', () => {
  // remove this line after implementing your tests
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { execute } = setupIntegrationTest()

  // remove this line after implementing your tests
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let bookingRepository: BookingRepository

  beforeEach(() => {
    bookingRepository = new BookingRepository()
  })

  describe('getAll', () => {
    // add tests for other scenarios as well if there are any
    it('should return all users', async () => {})
  })

  describe('get', () => {
    // add tests for other scenarios as well if there are any
    it('should return one booking', async () => {})
  })

  describe('insert', () => {
    // add tests for other scenarios as well if there are any
    it('should insert a new booking', async () => {})
  })

  describe('update', () => {
    // add tests for other scenarios as well if there are any
    it('should update a booking', async () => {})
  })
})
