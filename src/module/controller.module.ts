import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'

import { RolesGuard } from 'src/controller/roles.guard'

import { AuthenticationConfig } from '../application'
import {
  AuthenticationController,
  AuthenticationGuard,
  BookingController,
  CarController,
  CarTypeController,
  UserController,
} from '../controller'

import { ConfigModule } from './config.module'
import { ServiceModule } from './service.module'

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [AuthenticationConfig],
      useFactory(config: AuthenticationConfig) {
        return {
          secret: config.jwtSecret,
          signOptions: { expiresIn: '1d' },
        }
      },
    }),
    ServiceModule,
    ConfigModule,
  ],
  controllers: [
    AuthenticationController,
    CarController,
    CarTypeController,
    UserController,
    BookingController,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class ControllerModule {}
