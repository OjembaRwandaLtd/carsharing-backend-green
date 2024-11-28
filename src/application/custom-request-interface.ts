import { Request } from 'express'

import { AuthenticationGuard } from 'src/controller/authentication.guard'

import { Role } from '../application/role.enum'

export interface User {
  role: Role
}

export interface CustomRequest extends Request {
  [AuthenticationGuard.USER_REQUEST_PROPERTY]?: User
}
