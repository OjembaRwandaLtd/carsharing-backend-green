import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { ConfigModule as NestjsConfigModule } from '@nestjs/config'

import { ControllerModule, UtilityModule } from './module'

@Module({
  imports: [
    NestjsConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({
      max: 50,
      ttl: 0,
      isGlobal: true,
    }),
    UtilityModule,
    ControllerModule,
  ],
})
export class MainModule {}
