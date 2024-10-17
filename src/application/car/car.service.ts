import { Injectable, Logger } from '@nestjs/common'
import { type Except } from 'type-fest'

import { IDatabaseConnection } from '../../persistence/database-connection.interface'
import { type UserID } from '../user'

import { type Car, type CarID, type CarProperties } from './car'
import { ICarRepository } from './car.repository.interface'
import { type ICarService } from './car.service.interface'

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

  public async create(_data: Except<CarProperties, 'id'>): Promise<Car> {
    throw new Error('Not implemented create')
  }

  public async getAll(): Promise<Car[]> {
    try {
    const cars =  await this.databaseConnection.transactional(async tx => {
      return await this.carRepository.getAll(tx)
    })
    return cars
    } catch(error) {
      this.logger.error(error)
      throw error
    }
  }

  public async get(_id: CarID): Promise<Car> {
    try {
     const car = await this.databaseConnection.transactional(async(tx)=>{
      return await this.carRepository.get(tx,_id)
     }) 
     return car
    } catch (error) {
      this.logger.error(error)
      throw error
    }
  }

  public async update(
    _carId: CarID,
    _updates: Partial<Except<CarProperties, 'id'>>,
    _currentUserId: UserID,
  ): Promise<Car> {
    throw new Error('Not implemented update')
  }
}
