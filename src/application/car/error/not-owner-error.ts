import { CustomError } from 'ts-custom-error'

export class NotOwnerError extends CustomError {
  public readonly ownerId: number
  public readonly carId: number

  public constructor(ownerId: number, carId: number) {
    super(`You can't update a car that is not yours!`)

    this.ownerId = ownerId
    this.carId = carId
  }
}
