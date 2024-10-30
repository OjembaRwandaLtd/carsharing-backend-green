import { Cache } from '@nestjs/cache-manager'

import {
  type CarRepositoryMock,
  type DatabaseConnectionMock,
  mockCarRepository,
  mockCarTypeRepository,
  mockDatabaseConnection,
} from '../../mocks'
import { UserBuilder } from '../user/user.builder'

import { CarTypeRepositoryMock } from './../car-type/car-type.repository.mock'
import { CarBuilder } from './car.builder'
import { CarService } from './car.service'

describe('CarService', () => {
  let carService: CarService
  let carTypeRepositoryMock: CarTypeRepositoryMock
  let carRepositoryMock: CarRepositoryMock
  let databaseConnectionMock: DatabaseConnectionMock
  let cacheManagerMock: Cache

  beforeEach(() => {
    carRepositoryMock = mockCarRepository()
    databaseConnectionMock = mockDatabaseConnection()
    cacheManagerMock = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      reset: jest.fn(),
      store: {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        reset: jest.fn(),
        keys: jest.fn(),
        ttl: jest.fn(),
      },
    } as unknown as Cache
    carTypeRepositoryMock = mockCarTypeRepository()

    carService = new CarService(
      carRepositoryMock,
      carTypeRepositoryMock,
      databaseConnectionMock,
      cacheManagerMock,
    )
  })

  describe('update', () => {
    it('should update a car', async () => {
      const owner = new UserBuilder().build()
      const car = new CarBuilder().withOwner(owner).withHorsepower(50).build()
      const updatedCar = CarBuilder.from(car)
        .withId(car.id)
        .withHorsepower(555)
        .build()

      carRepositoryMock.get.mockResolvedValue(car)
      carRepositoryMock.update.mockResolvedValue(updatedCar)

      await expect(
        carService.update(car.id, { horsepower: 555 }, owner.id),
      ).resolves.toEqual(updatedCar)
    })

    it('should be able give all cars', async () => {
      const cars = [new CarBuilder().build(), new CarBuilder().build()]
      carRepositoryMock.getAll.mockResolvedValue(cars)
      await expect(carService.getAll()).resolves.toEqual(cars)
    })

    it('should be able give a car', async () => {
      const car = new CarBuilder().build()
      carRepositoryMock.get.mockResolvedValue(car)
      await expect(carService.get(car.id)).resolves.toEqual(car)
    })

    it('should create a new car', async () => {
      const car = new CarBuilder().build()
      const newCar = new CarBuilder().build()
      carRepositoryMock.insert.mockResolvedValue(newCar)
      await expect(carService.create(car)).resolves.toEqual(newCar)
    })
  })
})
