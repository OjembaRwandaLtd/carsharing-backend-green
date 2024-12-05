import { CustomError } from 'ts-custom-error'

export class UserAlreadyExistError extends CustomError {
  public readonly name: string

  public constructor(name: string) {
    super(`A user with this name already exists`)

    this.name = name
  }
}
