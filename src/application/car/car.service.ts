import { Injectable, Logger } from '@nestjs/common'
import { type Except } from 'type-fest'

import {
  IDatabaseConnection,
  Transaction,
} from '../../persistence/database-connection.interface'
import { AccessDeniedError } from '../access-denied.error'
import { IBookingRepository } from '../booking/booking.repository.interface'
import { ICarTypeRepository } from '../car-type'
import { type UserID } from '../user'

import { Car, type CarID, type CarProperties } from './car'
import { CarNotFoundError } from './car-not-found.error'
import { CarState } from './car-state'
import { ICarRepository } from './car.repository.interface'
import { type ICarService } from './car.service.interface'
import { DuplicateLicensePlateError } from './error'

@Injectable()
export class CarService implements ICarService {
  private readonly carRepository: ICarRepository
  private readonly carTypeRepository: ICarTypeRepository
  private readonly databaseConnection: IDatabaseConnection
  private readonly bookingRepository: IBookingRepository
  private readonly logger: Logger

  public constructor(
    carRepository: ICarRepository,
    carTypeRepository: ICarTypeRepository,
    databaseConnection: IDatabaseConnection,
    bookingRepository: IBookingRepository,
  ) {
    this.carRepository = carRepository
    this.carTypeRepository = carTypeRepository
    this.databaseConnection = databaseConnection
    this.bookingRepository = bookingRepository
    this.logger = new Logger(CarService.name)
  }

  // Please remove the next line when implementing this file.
  /* eslint-disable @typescript-eslint/require-await */

  public async create(data: Except<CarProperties, 'id'>): Promise<Car> {
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
    return await this.databaseConnection.transactional(async tx => {
      return await this.carRepository.getAll(tx)
    })
  }

  public async get(id: CarID): Promise<Car> {
    return await this.databaseConnection.transactional(async tx => {
      return await this.carRepository.get(tx, id)
    })
  }

  private async updateCarState(
    tx: Transaction,
    car: Car,
    updates: Partial<Except<CarProperties, 'id'>>,
    currentUserId: UserID,
  ): Promise<Car | null> {
    if (car.ownerId !== currentUserId) {
      const booking = await this.databaseConnection.transactional(tx =>
        this.bookingRepository.getByCarId(tx, car.id),
      )

      if (!booking || booking.renterId !== currentUserId) {
        throw new AccessDeniedError('car', car.id)
      }

      const carState = updates.state
      if (!carState) throw new AccessDeniedError('car', car.id)
      return new Car({
        ...car,
        state: carState,
      })
    }
    return null
  }

  public async update(
    carId: CarID,
    updates: Partial<Except<CarProperties, 'id'>>,
    currentUserId: UserID,
  ): Promise<Car> {
    return await this.databaseConnection.transactional(async tx => {
      const car = await this.carRepository.get(tx, carId)

      if (!car) throw new CarNotFoundError(carId)

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

      const updatedCarState = await this.updateCarState(
        tx,
        car,
        updates,
        currentUserId,
      )
      const carUpdate =
        updatedCarState ||
        new Car({
          ...car,
          ...updates,
          id: carId,
        })

      const updatedCar = await this.carRepository.update(tx, carUpdate)

      return updatedCar
    })
  }
}
