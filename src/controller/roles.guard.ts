import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  ForbiddenException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthenticationGuard } from './authentication.guard'
import { ROLES_KEY } from './roles.decorator'
import { Role } from 'src/application/role.enum'
import { Observable } from 'rxjs'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!requiredRoles) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const user = request[AuthenticationGuard.USER_REQUEST_PROPERTY]

    console.log(user)

    if (!user) {
      throw new ForbiddenException('User not found')
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('User does not have the required role')
    }

    return true
  }
}
