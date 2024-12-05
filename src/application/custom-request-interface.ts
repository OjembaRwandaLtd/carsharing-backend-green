import { Request } from 'express'

import { Role } from 'src/application/role.enum'
import { AuthenticationGuard } from 'src/controller/authentication.guard'

export interface User {
  role: Role
}

export interface CustomRequest extends Request {
  [AuthenticationGuard.USER_REQUEST_PROPERTY]?: User
}
