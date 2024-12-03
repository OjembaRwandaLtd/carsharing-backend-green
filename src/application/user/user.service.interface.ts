import { Except } from 'type-fest'

import { type User, type UserID, type UserProperties } from './user'

export abstract class IUserService {
  public abstract get(id: UserID): Promise<User>

  public abstract getAll(): Promise<User[]>

  public abstract find(id: UserID): Promise<User | null>

  public abstract findByName(name: string): Promise<User | null>

  public abstract create(user: Except<UserProperties, 'id'>): Promise<User>

  public abstract deleteById(id: UserID, currentUser: User): Promise<void>
}
