/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable } from 'rxjs'

import { CustomRequest } from 'src/application/custom-request-interface'
import { Role } from 'src/application/role.enum'

import { AuthenticationGuard } from './authentication.guard'
import { ROLES_KEY } from './roles.decorator'


@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles: Role[] | undefined = this.reflector.getAllAndOverride<
      Role[]
    >(ROLES_KEY, [context.getHandler(), context.getClass()])

    if (!requiredRoles) {
      return true
    }

    const request = context.switchToHttp().getRequest<CustomRequest>()
    const user = request[AuthenticationGuard.USER_REQUEST_PROPERTY] as
      | { role: Role }
      | undefined

    if (!user) {
      throw new ForbiddenException('User not found')
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('User does not have the required role')
    }

    return true
  }
}
