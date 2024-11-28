import { Injectable } from '@nestjs/common'
import { Except } from 'type-fest'

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
<<<<<<< HEAD
  role: Role
  is_deleted: boolean
=======
>>>>>>> be9b8611b843c197d394fd9140b470cb43a10e9a
}

function rowToDomain(row: Row): User {
  return new User({
    id: row.id as UserID,
    name: row.name,
    passwordHash: row.password,
<<<<<<< HEAD
    role: row.role,
    isDeleted: row.is_deleted,
=======
>>>>>>> be9b8611b843c197d394fd9140b470cb43a10e9a
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
    const rows = await tx.any<Row>('SELECT * FROM users AND is_deleted = false')

    return rows.map(row => rowToDomain(row))
  }

<<<<<<< HEAD
  public async deleteById(tx: Transaction, id: UserID): Promise<void> {
    const result = await tx.result(
      `UPDATE users SET is_deleted = true WHERE id = $(id)`,
      { id },
    )
    if (result.rowCount === 0) {
      throw new UserNotFoundError(id)
    }
=======
  public async insert(
    tx: Transaction,
    user: Except<User, 'id'>,
  ): Promise<User> {
    const row = await tx.one<Row>(
      'INSERT INTO users (name, role, password) VALUES ($(name), $(role), $(passwordHash)) RETURNING *',
      { ...user },
    )
    return rowToDomain(row)
>>>>>>> ft/delete-endpoint
  }
}
