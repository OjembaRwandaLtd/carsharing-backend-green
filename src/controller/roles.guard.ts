import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable } from 'rxjs'
import { ROLES_KEY } from './roles.decorator'
import { Role } from 'src/application/role.enum'
import { ValidationError } from 'class-validator'

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

    const user = context.switchToHttp().getRequest().user
    if (!user || !user.roles) {
      throw new HttpException('User roles are not defined', 400)
    }

    const roles = user.roles
    return requiredRoles.some(role => roles.includes(role))
  }
}
