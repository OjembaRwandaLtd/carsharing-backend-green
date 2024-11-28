import { Injectable } from '@nestjs/common'

import { Role } from 'src/application/role.enum'

import {
  type IUserRepository,
  User,
  type UserID,
  UserNotFoundError,
} from '../application'

import { type Transaction } from './database-connection.interface'

/**********************************************************************************************************************\
 *                                                                                                                     *
 *   This file is already fully implemented. You don't need to modify it to successfully finish your project.          *
 *                                                                                                                     *
 \*********************************************************************************************************************/

type Row = {
  id: number
  name: string
  password: string
  role: Role
  is_deleted: boolean
}

function rowToDomain(row: Row): User {
  return new User({
    id: row.id as UserID,
    name: row.name,
    passwordHash: row.password,
    role: row.role,
    isDeleted: row.is_deleted,
  })
}

@Injectable()
export class UserRepository implements IUserRepository {
  public async find(tx: Transaction, id: UserID): Promise<User | null> {
    const row = await tx.oneOrNone<Row>(
      'SELECT * FROM users WHERE id = $(id) AND is_deleted = false',
      {
        id,
      },
    )

    return row ? rowToDomain(row) : null
  }

  public async findByName(tx: Transaction, name: string): Promise<User | null> {
    const row = await tx.oneOrNone<Row>(
      'SELECT * FROM users WHERE name = $(name) AND is_deleted = false',
      {
        name,
      },
    )

    return row ? rowToDomain(row) : null
  }

  public async get(tx: Transaction, id: UserID): Promise<User> {
    const user = await this.find(tx, id)

    if (!user) {
      throw new UserNotFoundError(id)
    }

    return user
  }

  public async getAll(tx: Transaction): Promise<User[]> {
    const rows = await tx.any<Row>(
      'SELECT * FROM users WHERE is_deleted = false',
    )

    return rows.map(row => rowToDomain(row))
  }

  public async deleteById(tx: Transaction, id: UserID): Promise<void> {
    const result = await tx.result(
      `UPDATE users SET is_deleted = true WHERE id = $(id)`,
      { id },
    )
    if (result.rowCount === 0) {
      throw new UserNotFoundError(id)
    }
  }
}
