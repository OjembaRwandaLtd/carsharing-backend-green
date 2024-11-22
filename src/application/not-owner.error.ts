import { CustomError } from 'ts-custom-error'

export class NotOwnerError extends CustomError {
  public constructor(resource: string, action?: string) {
    super(
      `Access denied: You are not the owner of this ${resource}${
        action ? ` and cannot ${action}` : ''
      }`,
    )
  }
}
