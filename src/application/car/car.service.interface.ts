import { type Except } from 'type-fest'

import { type UserID } from '../user'

import { type Car, type CarID, type CarProperties } from './car'

export abstract class ICarService {
  public abstract update(
    carId: CarID,
    updates: Partial<Except<CarProperties, 'id'>>,
    currentUserId: UserID,
  ): Promise<Car>

  // When creating a car, we don't allow an 'id' to be passed in (but require all other properties). The reason for this
  // is that the id is generated by the database.
  public abstract create(properties: Except<CarProperties, 'id'>): Promise<Car>

  public abstract getAll(): Promise<Car[]>

  public abstract get(id: CarID): Promise<Car>
}
