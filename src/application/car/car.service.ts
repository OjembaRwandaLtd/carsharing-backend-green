import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { type Except } from 'type-fest'

import { IDatabaseConnection } from '../../persistence/database-connection.interface'
import { AccessDeniedError } from '../access-denied.error'
import { ICarTypeRepository } from '../car-type'
import { type UserID } from '../user'

import { Car, type CarID, type CarProperties } from './car'
import { CarNotFoundError } from './car-not-found.error'
import { ICarRepository } from './car.repository.interface'
import { type ICarService } from './car.service.interface'
import { DuplicateLicensePlateError } from './error'

@Injectable()
export class CarService implements ICarService {
  private readonly carRepository: ICarRepository
  private readonly carTypeRepository: ICarTypeRepository
  private readonly databaseConnection: IDatabaseConnection
  private readonly logger: Logger

  public constructor(
    carRepository: ICarRepository,
    carTypeRepository: ICarTypeRepository,
    databaseConnection: IDatabaseConnection,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.carRepository = carRepository
    this.carTypeRepository = carTypeRepository
    this.databaseConnection = databaseConnection
    this.logger = new Logger(CarService.name)
    this.cacheManager = cacheManager
  }

  // Please remove the next line when implementing this file.
  /* eslint-disable @typescript-eslint/require-await */

  public async create(data: Except<CarProperties, 'id'>): Promise<Car> {
    await this.cacheManager.set(
      data.licensePlate ? data.licensePlate.toString() : '',
      data,
    )
    const cacheCar = await this.cacheManager.get<Car>(
      data.licensePlate ? data.licensePlate.toString() : '',
    )
    if (cacheCar) {
      return cacheCar
    }
    return this.databaseConnection.transactional(async tx => {
      if (data.licensePlate) {
        const existingCar = await this.carRepository.findByLicensePlate(
          tx,
          data.licensePlate,
        )
        if (existingCar !== null) {
          throw new DuplicateLicensePlateError(data.licensePlate)
        }
      }
      await this.carTypeRepository.get(tx, data.carTypeId)
      return await this.carRepository.insert(tx, data)
    })
  }

  public async getAll(): Promise<Car[]> {
    const CacheKey = 'cars'
    const cachedCars = await this.cacheManager.get<Car[]>(CacheKey)
    if (cachedCars) {
      return cachedCars
    }
    return await this.databaseConnection.transactional(async tx => {
      return await this.carRepository.getAll(tx)
    })
  }

  public async get(id: CarID): Promise<Car> {
    const cachedCar = await this.cacheManager.get<Car>(id.toString())
    if (cachedCar) {
      this.logger.log(`Cache hit for car ${id}`)
      return cachedCar
    }
    return await this.databaseConnection.transactional(async tx => {
      return await this.carRepository.get(tx, id)
    })
  }

  public async update(
    carId: CarID,
    updates: Partial<Except<CarProperties, 'id'>>,
    currentUserId: UserID,
  ): Promise<Car> {
    return await this.databaseConnection.transactional(async tx => {
      const car = await this.carRepository.get(tx, carId)

      if (!car) {
        throw new CarNotFoundError(carId)
      }

      if (currentUserId !== car.ownerId) {
        throw new AccessDeniedError(car.name, carId)
      }

      if (updates.licensePlate) {
        const existingCar = await this.carRepository.findByLicensePlate(
          tx,
          updates.licensePlate,
        )
        if (existingCar !== null && existingCar.id !== car.id) {
          throw new DuplicateLicensePlateError(updates.licensePlate)
        }
      }

      if (updates.carTypeId) {
        await this.carTypeRepository.get(tx, updates.carTypeId)
      }

      const carUpdate = new Car({
        ...car,
        ...updates,
        id: carId,
      })

      const updatedCar = await this.carRepository.update(tx, carUpdate)
      if (!updatedCar) {
        throw new CarNotFoundError(carId)
      }

      return updatedCar
    })
  }
}
