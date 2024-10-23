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

  beforeEach(() => {
    carRepositoryMock = mockCarRepository()
    databaseConnectionMock = mockDatabaseConnection()
    carTypeRepositoryMock = mockCarTypeRepository()
    carService = new CarService(
      carRepositoryMock,
      carTypeRepositoryMock,
      databaseConnectionMock,
    )
  })

  describe('update', () => {
    xit('should update a car', async () => {
      const owner = new UserBuilder().build()
      const car = new CarBuilder().withOwner(owner).withHorsepower(50).build()
      const updatedCar = CarBuilder.from(car).withHorsepower(555).build()

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
  })
})
