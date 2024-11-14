import { Injectable } from '@nestjs/common'
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

import { ICarRepository } from '../application'
import { IDatabaseConnection } from '../persistence'

@ValidatorConstraint({ async: true })
@Injectable()
export class IsUniqueLicensePlateConstraint
  implements ValidatorConstraintInterface
{
  carRepository: ICarRepository
  databaseConnection: IDatabaseConnection

  public constructor(
    carRepository: ICarRepository,
    databaseConnection: IDatabaseConnection,
  ) {
    this.carRepository = carRepository
    this.databaseConnection = databaseConnection
  }

  validate(
    licensePlate: string,
    _validationArguments?: ValidationArguments,
  ): Promise<boolean> | boolean {
    return this.databaseConnection.transactional(async tx => {
      const car = await this.carRepository.findByLicensePlate(tx, licensePlate)
      return !car
    })
  }
  defaultMessage?(_validationArguments?: ValidationArguments): string {
    return 'A car with this license plate already exists'
  }
}
export function IsUniqueLicensePlate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUniqueLicensePlateConstraint,
    })
  }
}
