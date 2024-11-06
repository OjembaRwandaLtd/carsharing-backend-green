import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator'

import { DuplicateLicensePlateError } from 'src/application/car/error'
import { DatabaseConnection } from 'src/persistence'

import { CarRepository } from './../persistence/car.repository'

export function IsUniqueLicensePlate(
  carRepository: CarRepository,
  databaseConnection: DatabaseConnection,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isUniqueLicensePlate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        async validate(value: string, _args?: ValidationArguments) {
          return await databaseConnection.transactional(async tx => {
            const existingCar = await carRepository.findByLicensePlate(
              tx,
              value,
            )
            if (existingCar !== null) {
              throw new DuplicateLicensePlateError(value)
            }
            return true
          })
        },
      },
    })
  }
}
