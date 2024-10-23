import { Injectable, Logger } from '@nestjs/common'
import { type Except } from 'type-fest'

import { IDatabaseConnection } from '../../persistence/database-connection.interface'
import { type UserID } from '../user'

import { Car, type CarID, type CarProperties } from './car'
import { ICarRepository } from './car.repository.interface'
import { type ICarService } from './car.service.interface'
import { DuplicateLicensePlateError } from './error'

@Injectable()
export class CarService implements ICarService {
  private readonly carRepository: ICarRepository
  private readonly databaseConnection: IDatabaseConnection
  private readonly logger: Logger

  public constructor(
    carRepository: ICarRepository,
    databaseConnection: IDatabaseConnection,
  ) {
    this.carRepository = carRepository
    this.databaseConnection = databaseConnection
    this.logger = new Logger(CarService.name)
  }

  // Please remove the next line when implementing this file.
  /* eslint-disable @typescript-eslint/require-await */

  public async create(data: Except<CarProperties, 'id'>): Promise<Car> {
    return this.databaseConnection.transactional(async tx => {
      if (
        data.licensePlate &&
        this.carRepository.findByLicensePlate(tx, data.licensePlate) !== null
      )
        throw new DuplicateLicensePlateError(data.licensePlate)
      return await this.carRepository.insert(tx, data)
    })
  }

  public async getAll(): Promise<Car[]> {
    try {
      return await this.databaseConnection.transactional(async tx => {
        return await this.carRepository.getAll(tx)
      })
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  public async get(_id: CarID): Promise<Car> {
    try {
      return await this.databaseConnection.transactional(async tx => {
        return await this.carRepository.get(tx, _id)
      })
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  public async update(
    carId: CarID,
    updates: Partial<Except<CarProperties, 'id'>>,
    _currentUserId: UserID,
  ): Promise<Car> {
    return this.databaseConnection.transactional(async tx => {
      const car = await this.carRepository.get(tx, carId)

      const carUpdate = new Car({
        ...car,
        ...updates,
        id: carId,
      })
      return this.carRepository.update(tx, carUpdate)
    })
  }
}
