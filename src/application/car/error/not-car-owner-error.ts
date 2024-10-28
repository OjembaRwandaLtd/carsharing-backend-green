import { CustomError } from 'ts-custom-error'

export class NotCarOwnerError extends CustomError {
  public constructor() {
    super(`You are not the owner of this car`)
  }
}