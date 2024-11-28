import { CustomError } from 'ts-custom-error'

export class BadRequestError extends CustomError {
  public constructor(message: string) {
    super(message)
  }
}
