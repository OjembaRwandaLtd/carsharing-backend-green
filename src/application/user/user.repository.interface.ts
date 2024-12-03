import { Except } from 'type-fest'

import { type Transaction } from '../../persistence'

import { UserProperties, type User, type UserID } from './user'

export abstract class IUserRepository {
  public abstract find(tx: Transaction, id: UserID): Promise<User | null>

  public abstract findByName(
    tx: Transaction,
    username: string,
  ): Promise<User | null>

  public abstract get(tx: Transaction, id: UserID): Promise<User>

  public abstract getAll(tx: Transaction): Promise<User[]>

  public abstract insert(
    tx: Transaction,
    user: Except<UserProperties, 'id'>,
  ): Promise<User>

  public abstract deleteById(tx: Transaction, id: UserID): Promise<void>
}
