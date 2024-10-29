import { ForbiddenException, Injectable, Logger } from '@nestjs/common'
import { type Except } from 'type-fest'

import { IDatabaseConnection } from '../../persistence/database-connection.interface'
import { ICarTypeRepository } from '../car-type'
import { type UserID } from '../user'

import { Car, type CarID, type CarProperties } from './car'
import { ICarRepository } from './car.repository.interface'
import { type ICarService } from './car.service.interface'
import { NotCarOwnerError, DuplicateLicensePlateError } from './error'

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
  ) {
    this.carRepository = carRepository
    this.carTypeRepository = carTypeRepository
    this.databaseConnection = databaseConnection
    this.logger = new Logger(CarService.name)
  }

  // Please remove the next line when implementing this file.
  /* eslint-disable @typescript-eslint/require-await */

  public async create(data: Except<CarProperties, 'id'>): Promise<Car> {
    return this.databaseConnection.transactional(async tx => {
      if (data.licensePlate) {
        const lincensePlate = await this.carRepository.findByLicensePlate(
          tx,
          data.licensePlate,
        )
        if (lincensePlate !== null) {
          throw new DuplicateLicensePlateError(data.licensePlate)
        }
      }
      await this.carTypeRepository.get(tx, data.carTypeId)
      return await this.carRepository.insert(tx, data)
    })
  }

  public async getAll(): Promise<Car[]> {
    return await this.databaseConnection.transactional(async tx => {
      return await this.carRepository.getAll(tx)
    })
  }

  public async get(_id: CarID): Promise<Car> {
    return await this.databaseConnection.transactional(async tx => {
      return await this.carRepository.get(tx, _id)
    })
  }

  public async update(
    carId: CarID,
    updates: Partial<Except<CarProperties, 'id'>>,
    currentUserId: UserID,
  ): Promise<Car> {
    return this.databaseConnection.transactional(async tx => {
      const car = await this.carRepository.get(tx, carId)

      if (currentUserId !== car.ownerId) {
        throw new NotCarOwnerError()
      }

      if (updates.licensePlate) {
        const lincensePlate = await this.carRepository.findByLicensePlate(
          tx,
          updates.licensePlate,
        )
        if (lincensePlate !== null) {
          throw new DuplicateLicensePlateError(updates.licensePlate)
        }
      }

      const carUpdate = new Car({
        ...car,
        ...updates,
        id: carId,
      })
      return this.carRepository.update(tx, carUpdate)
    })
  }
}
