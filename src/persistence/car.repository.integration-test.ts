import {
  setupIntegrationTest,
  carTypes,
  users,
  cars,
} from '../../jest.integration-test-setup'
import { type CarID, CarNotFoundError } from '../application'
import { Car, FuelType, CarState } from '../application/car'

import { CarRepository } from './car.repository'

describe('CarRepository', () => {
  const { execute } = setupIntegrationTest()

  let carRepository: CarRepository

  beforeEach(() => {
    carRepository = new CarRepository()
  })

  describe('getAll', () => {
    it('should return all cars', async () => {
      const actual = await execute(tx => carRepository.getAll(tx))

      expect(actual).toIncludeSameMembers(Object.values(cars))
    })
  })

  describe('get', () => {
    it('should return a car', async () => {
      const actual = await execute(tx =>
        carRepository.get(tx, cars.beatrice.id),
      )

      expect(actual).toEqual(cars.beatrice)
    })

    it('should throw if a car does not exist', async () => {
      await expect(
        execute(tx => carRepository.get(tx, 99 as CarID)),
      ).rejects.toThrow(CarNotFoundError)
    })
  })

  describe('findByLicensePlate', () => {
    it('should return a car when license plate exists', async () => {
      const actual = await execute(tx =>
        carRepository.findByLicensePlate(tx, cars.beatrice.licensePlate!),
      )

      expect(actual).toEqual(cars.beatrice)
    })

    it('should return null when license plate does not exist', async () => {
      const actual = await execute(tx =>
        carRepository.findByLicensePlate(tx, 'NONEXISTENT'),
      )

      expect(actual).toBeNull()
    })
  })

  describe('update', () => {
    it('should update a car', async () => {
      const updated = new Car({
        ...cars.beatrice,
        name: 'Updated Moni Cooper',
        info: 'Updated info',
      })

      const actual = await execute(tx => carRepository.update(tx, updated))

      expect(actual).toEqual(updated)
    })

    it('should throw if a car does not exist', async () => {
      const nonExistentCar = new Car({
        ...cars.beatrice,
        id: 99 as CarID,
      })

      await expect(
        execute(tx => carRepository.update(tx, nonExistentCar)),
      ).rejects.toThrow(CarNotFoundError)
    })
  })

  describe('insert', () => {
    it('should insert a new car', async () => {
      const newCar = {
        carTypeId: carTypes.moniCooper.id,
        ownerId: users.beatrice.id,
        name: 'New Moni Cooper',
        state: 'available' as CarState,
        fuelType: 'electric' as FuelType,
        horsepower: 184,
        licensePlate: 'NEW1234',
        info: 'Brand new car',
      }

      const actual = await execute(tx => carRepository.insert(tx, newCar))

      expect(actual).toMatchObject(newCar)
      expect(actual.id).toBeDefined()
    })
  })
})
