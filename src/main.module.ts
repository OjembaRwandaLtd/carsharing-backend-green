import { Module } from '@nestjs/common'
import { ConfigModule as NestjsConfigModule } from '@nestjs/config'

import { ControllerModule, UtilityModule, ValidationModule } from './module'

@Module({
  imports: [
    NestjsConfigModule.forRoot({ isGlobal: true }),
    UtilityModule,
    ControllerModule,
    ValidationModule,
  ],
})
export class MainModule {}
