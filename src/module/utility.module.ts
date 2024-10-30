import { CacheInterceptor } from '@nestjs/cache-manager'
import { Global, Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import dayjs from 'dayjs'

import { ITimeProvider } from '../application'

@Global()
@Module({
  providers: [
    {
      provide: ITimeProvider,
      useValue: {
        now() {
          return dayjs()
        },
      },
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
  exports: [ITimeProvider],
})
export class UtilityModule {}
