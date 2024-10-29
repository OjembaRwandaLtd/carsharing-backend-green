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

@Injectable()
export class CarRepository implements ICarRepository {
  public find(_tx: Transaction, _id: CarID): Promise<Car | null> {
    throw new Error('Not implemented')
  }

  public async get(tx: Transaction, _id: CarID): Promise<Car> {
    const row: Row[] = await tx.any(
      `SELECT * FROM cars WHERE id = ${String(_id)}`,
    )
    return row.map(rowToDomain)[0]
  }

  public async getAll(tx: Transaction): Promise<Car[]> {
    const cars: Row[] = await tx.query('SELECT * FROM cars')
    return cars.map(rowToDomain)
  }

  public async findByLicensePlate(
    tx: Transaction,
    licensePlate: string,
  ): Promise<Car | null> {
    const maybeRow = await tx.oneOrNone<Row>(
      'SELECT * FROM cars WHERE license_plate = $(licensePlate)',
      {
        licensePlate,
      },
    )
    return maybeRow ? rowToDomain(maybeRow) : null
  }

  public async update(tx: Transaction, car: Car): Promise<Car> {
    const row = await tx.oneOrNone<Row>(
      `
      UPDATE cars SET
        car_type_id = $(carTypeId),
        name = $(name),
        state = $(state),
        owner_id = $(ownerId),
        fuel_type = $(fuelType),
        horsepower = $(horsepower),
        license_plate = $(licensePlate),
        info = $(info)
      WHERE
        id = $(id)
       RETURNING *`,
      { ...car },
    )
    if (row === null) throw new CarNotFoundError(car.id)

    return rowToDomain(row)
  }

  public async insert(
    tx: Transaction,
    car: Except<CarProperties, 'id'>,
  ): Promise<Car> {
    const row: Row = await tx.one<Row>(
      `INSERT INTO cars (
        car_type_id,
        owner_id, 
        state, 
        name,
        fuel_type,
        horsepower,
        license_plate,
        info
      ) VALUES (
        $(carTypeId),
        $(ownerId),
        $(state),
        $(name),
        $(fuelType),
        $(horsepower),
        $(licensePlate),
        $(info)
      ) RETURNING *`,
      { ...car },
    )
    return rowToDomain(row)
  }
}
