import { Injectable } from '@nestjs/common'
import { type Except } from 'type-fest'

import {
  type CarID,
  type CarProperties,
  type CarState,
  type CarTypeID,
  type FuelType,
  type ICarRepository,
  type UserID,
} from '../application'
import { Car, CarNotFoundError } from '../application/car'

import { type Transaction } from './database-connection.interface'
import { isNull } from 'class-validator-extended'

type Row = {
  id: number
  car_type_id: number
  owner_id: number
  name: string
  state: string
  fuel_type: string
  horsepower: number
  license_plate: string | null
  info: string | null
}

// Please remove the next line when implementing this file.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function rowToDomain(row: Row): Car {
  return new Car({
    id: row.id as CarID,
    carTypeId: row.car_type_id as CarTypeID,
    ownerId: row.owner_id as UserID,
    state: row.state as CarState,
    name: row.name,
    fuelType: row.fuel_type as FuelType,
    horsepower: row.horsepower,
    licensePlate: row.license_plate,
    info: row.info,
  })
}

// Please remove the next line when implementing this file.
/* eslint-disable @typescript-eslint/require-await */

@Injectable()
export class CarRepository implements ICarRepository {
  public async find(tx: Transaction, _id: CarID): Promise<Car | null> {
  
    const car: Row[] = await tx.any(
      `SELECT * FROM cars WHERE id = ${String(_id)}`,
    )
    return car.map(rowToDomain)[0]
  }

  public async get(tx: Transaction, id: CarID): Promise<Car> {
    const car = await this.find(tx, id)
    if (isNull(car)) throw new CarNotFoundError(id)
    return car
  }

  public async getAll(tx: Transaction): Promise<Car[]> {
    const cars: Row[] = await tx.any('SELECT * FROM cars')
    return cars.map(rowToDomain)
  }

  public async findByLicensePlate(
    _tx: Transaction,
    _licensePlate: string,
  ): Promise<Car | null> {
    throw new Error('Not implemented')
  }

  public async update(_tx: Transaction, _car: Car): Promise<Car> {
    throw new Error('Not implemented')
  }

  public async insert(
    tx: Transaction,
    car: Except<CarProperties, 'id'>,
  ): Promise<Car> {
    const row: Row[] = await tx.query(
      `INSERT INTO cars (car_type_id, owner_id, state, name, fuel_type, horsepower, license_plate, info) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        car.carTypeId,
        car.ownerId,
        car.state,
        car.name,
        car.fuelType,
        car.horsepower,
        car.licensePlate,
        car.info,
      ],
    )

    return row.map(rowToDomain)[0]
  }
}
