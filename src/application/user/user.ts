import {
  IsHash,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  IsBoolean,
} from 'class-validator'
import { type Opaque } from 'type-fest'

import { validate } from '../../util'
import { Role } from '../role.enum'

export type UserID = Opaque<number, 'user-id'>
export type UserProperties = {
  id: UserID
  name: string
  passwordHash: string
  role: Role
  isDeleted: boolean
}

export class User {
  @IsInt()
  @IsPositive()
  public readonly id: UserID

  @IsString()
  @IsNotEmpty()
  public readonly name: string

  @IsHash('sha512')
  public readonly passwordHash: string

  @IsString()
  @IsNotEmpty()
  public readonly role: Role

  @IsBoolean()
  public readonly isDeleted: boolean

  public constructor(data: UserProperties) {
    this.id = data.id
    this.name = data.name
    this.passwordHash = data.passwordHash
    this.role = data.role
    this.isDeleted = data.isDeleted

    validate(this)
  }
}
