import { ApiProperty, PickType } from '@nestjs/swagger'
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
} from 'class-validator'
import { type Writable } from 'type-fest'

import { User, type UserID } from '../../application'
import { Role } from '../../application/role.enum.ts'
import { validate } from '../../util'

export class UserDTO {
  @ApiProperty({
    description: 'The id of the user.',
    minimum: 1,
    example: 42,
  })
  @IsInt()
  @IsPositive()
  public readonly id!: UserID

  @ApiProperty({
    description: 'The name of the user.',
    example: 'Beatrice',
  })
  @IsString()
  @IsNotEmpty()
  public readonly name!: string

  @ApiProperty({
    description: 'The role of user',
    enum: Role,
    example: Role.ADMIN,
  })
  @IsEnum(Role)
  @IsNotEmpty()
  public readonly role!: Role

  @ApiProperty({
    description: 'The password of the user.',
    example: 'password',
  })
  @IsString()
  @IsNotEmpty()
  public readonly passwordHash!: string

  public static create(data: {
    id: UserID
    name: string
    passwordHash: string
    role: Role
  }): UserDTO {
    const instance = new UserDTO() as Writable<UserDTO>

    instance.id = data.id
    instance.name = data.name
    instance.role = data.role
    instance.passwordHash = data.passwordHash

    return validate(instance)
  }

  public static fromModel(user: User): UserDTO {
    // Note that this transformation drops the "passwordHash" field! We don't ever want that to be sent to the
    // client.
    return UserDTO.create(user)
  }
}

export class CreateUserDTO extends PickType(UserDTO, [
  'name',
  'role',
  'passwordHash',
] as const) {}
