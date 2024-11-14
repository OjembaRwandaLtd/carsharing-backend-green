import { Module } from '@nestjs/common'

import { IsUniqueLicensePlateConstraint } from 'src/validation/is-unique-license-plate.validation'

import { DatabaseModule } from './database.module'
import { RepositoryModule } from './repository.module'

@Module({
  imports: [DatabaseModule, RepositoryModule],
  providers: [IsUniqueLicensePlateConstraint],
  exports: [],
})
export class ValidationModule {}
